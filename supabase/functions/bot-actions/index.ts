import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-bot-secret',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Verify bot secret
    const botSecret = req.headers.get('x-bot-secret');
    const expectedSecret = Deno.env.get('BOT_SECRET');
    
    if (!expectedSecret) {
      console.error('BOT_SECRET not configured');
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (botSecret !== expectedSecret) {
      console.error('Invalid bot secret provided');
      return new Response(
        JSON.stringify({ error: 'Unauthorized - Invalid bot credentials' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body = await req.json();
    const { action, payload } = body;

    console.log(`Bot action requested: ${action}`, payload);

    switch (action) {
      case 'add_comment': {
        const { task_id, content } = payload;
        
        if (!task_id || !content) {
          return new Response(
            JSON.stringify({ error: 'Missing task_id or content' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const { data, error } = await supabase
          .from('task_comments')
          .insert({
            task_id,
            author: 'Crypto_Chad',
            content,
          })
          .select()
          .single();

        if (error) {
          console.error('Error adding comment:', error);
          return new Response(
            JSON.stringify({ error: 'Failed to add comment', details: error.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        console.log('Bot comment added:', data);
        return new Response(
          JSON.stringify({ success: true, data }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'create_task': {
        const { title, description, priority = 'medium', status = 'todo' } = payload;
        
        if (!title) {
          return new Response(
            JSON.stringify({ error: 'Missing title' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const { data, error } = await supabase
          .from('tasks')
          .insert({
            title,
            description: description || '',
            assignee: 'Crypto_Chad',
            priority,
            status,
          })
          .select()
          .single();

        if (error) {
          console.error('Error creating task:', error);
          return new Response(
            JSON.stringify({ error: 'Failed to create task', details: error.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        console.log('Bot created task:', data);
        return new Response(
          JSON.stringify({ success: true, data }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'update_task': {
        const { task_id, updates } = payload;
        
        if (!task_id || !updates) {
          return new Response(
            JSON.stringify({ error: 'Missing task_id or updates' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Map allowed fields
        const allowedUpdates: Record<string, unknown> = {};
        if (updates.title !== undefined) allowedUpdates.title = updates.title;
        if (updates.description !== undefined) allowedUpdates.description = updates.description;
        if (updates.status !== undefined) allowedUpdates.status = updates.status;
        if (updates.priority !== undefined) allowedUpdates.priority = updates.priority;

        const { data, error } = await supabase
          .from('tasks')
          .update(allowedUpdates)
          .eq('id', task_id)
          .select()
          .single();

        if (error) {
          console.error('Error updating task:', error);
          return new Response(
            JSON.stringify({ error: 'Failed to update task', details: error.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        console.log('Bot updated task:', data);
        return new Response(
          JSON.stringify({ success: true, data }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'complete_task': {
        const { task_id, comment } = payload;
        
        if (!task_id) {
          return new Response(
            JSON.stringify({ error: 'Missing task_id' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Update task status to completed
        const { data: taskData, error: taskError } = await supabase
          .from('tasks')
          .update({ status: 'completed' })
          .eq('id', task_id)
          .select()
          .single();

        if (taskError) {
          console.error('Error completing task:', taskError);
          return new Response(
            JSON.stringify({ error: 'Failed to complete task', details: taskError.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Optionally add a completion comment
        let commentData = null;
        if (comment) {
          const { data, error: commentError } = await supabase
            .from('task_comments')
            .insert({
              task_id,
              author: 'Crypto_Chad',
              content: comment,
            })
            .select()
            .single();

          if (commentError) {
            console.error('Error adding completion comment:', commentError);
          } else {
            commentData = data;
          }
        }

        console.log('Bot completed task:', taskData);
        return new Response(
          JSON.stringify({ success: true, task: taskData, comment: commentData }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'mark_as_read': {
        const { task_id } = payload;
        
        if (!task_id) {
          return new Response(
            JSON.stringify({ error: 'Missing task_id' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Bot marks as read by updating last_viewed_bot
        const { data, error } = await supabase
          .from('tasks')
          .update({ last_viewed_bot: new Date().toISOString() })
          .eq('id', task_id)
          .select()
          .single();

        if (error) {
          console.error('Error marking task as read:', error);
          return new Response(
            JSON.stringify({ error: 'Failed to mark task as read', details: error.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        console.log('Bot marked task as read:', data);
        return new Response(
          JSON.stringify({ success: true, data }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      default:
        return new Response(
          JSON.stringify({ error: `Unknown action: ${action}` }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

  } catch (error: unknown) {
    console.error('Error processing bot action:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
