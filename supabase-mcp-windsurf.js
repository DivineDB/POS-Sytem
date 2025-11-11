#!/usr/bin/env node

/**
 * Windsurf-Compatible Supabase MCP Server
 * Direct MCP protocol implementation without SDK dependencies
 */

const { createClient } = require('@supabase/supabase-js');
const fetch = require('node-fetch');

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL || 'https://urbeysueketnxjsmgnmg.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVyYmV5c3Vla2V0bnhqc21nbm1nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE4MzE1NTksImV4cCI6MjA3NzQwNzU1OX0.TxbDIotPZI4zD2HCMwId_0s-JH2j_FC5xNm3XsqYmTk';

// Create Supabase client with enhanced configuration for network issues
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  },
  global: {
    fetch: fetch
  }
});

// MCP Server Info
const SERVER_INFO = {
  name: 'supabase-mcp-server',
  version: '1.0.0'
};

// Available tools
const TOOLS = [
  {
    name: 'supabase_query',
    description: 'Execute SELECT queries on Supabase tables',
    inputSchema: {
      type: 'object',
      properties: {
        table: { type: 'string', description: 'Table name to query' },
        columns: { type: 'string', description: 'Columns to select (default: *)', default: '*' },
        filters: { type: 'object', description: 'Filters to apply (key-value pairs)' },
        limit: { type: 'number', description: 'Limit number of results', default: 10 }
      },
      required: ['table']
    }
  },
  {
    name: 'supabase_insert',
    description: 'Insert data into Supabase tables',
    inputSchema: {
      type: 'object',
      properties: {
        table: { type: 'string', description: 'Table name to insert into' },
        data: { type: 'object', description: 'Data to insert' }
      },
      required: ['table', 'data']
    }
  },
  {
    name: 'supabase_update',
    description: 'Update data in Supabase tables',
    inputSchema: {
      type: 'object',
      properties: {
        table: { type: 'string', description: 'Table name to update' },
        data: { type: 'object', description: 'Data to update' },
        filters: { type: 'object', description: 'Filters to identify rows to update' }
      },
      required: ['table', 'data', 'filters']
    }
  },
  {
    name: 'supabase_delete',
    description: 'Delete data from Supabase tables',
    inputSchema: {
      type: 'object',
      properties: {
        table: { type: 'string', description: 'Table name to delete from' },
        filters: { type: 'object', description: 'Filters to identify rows to delete' }
      },
      required: ['table', 'filters']
    }
  },
  {
    name: 'supabase_list_tables',
    description: 'List all available tables in the database',
    inputSchema: {
      type: 'object',
      properties: {}
    }
  },
  {
    name: 'supabase_describe_table',
    description: 'Get table schema and sample data',
    inputSchema: {
      type: 'object',
      properties: {
        table: { type: 'string', description: 'Table name to describe' }
      },
      required: ['table']
    }
  }
];

// Tool implementations
async function executeQuery({ table, columns = '*', filters = {}, limit = 10 }) {
  try {
    let query = supabase.from(table).select(columns);
    
    Object.entries(filters).forEach(([key, value]) => {
      query = query.eq(key, value);
    });
    
    const { data, error } = await query.limit(limit);
    
    if (error) {
      throw new Error(`Query failed: ${error.message}`);
    }
    
    return `Query successful! Found ${data.length} rows:\n${JSON.stringify(data, null, 2)}`;
  } catch (err) {
    if (err.message.includes('fetch failed')) {
      throw new Error(`Network connectivity issue. Please check your internet connection and Supabase URL: ${supabaseUrl}`);
    }
    throw err;
  }
}

async function insertData({ table, data }) {
  const { data: result, error } = await supabase
    .from(table)
    .insert([data])
    .select()
    .single();
  
  if (error) {
    throw new Error(`Insert failed: ${error.message}`);
  }
  
  return `Insert successful!\n${JSON.stringify(result, null, 2)}`;
}

async function updateData({ table, data, filters }) {
  let query = supabase.from(table).update(data);
  
  Object.entries(filters).forEach(([key, value]) => {
    query = query.eq(key, value);
  });
  
  const { data: result, error } = await query.select();
  
  if (error) {
    throw new Error(`Update failed: ${error.message}`);
  }
  
  return `Update successful! Updated ${result.length} rows:\n${JSON.stringify(result, null, 2)}`;
}

async function deleteData({ table, filters }) {
  let query = supabase.from(table).delete();
  
  Object.entries(filters).forEach(([key, value]) => {
    query = query.eq(key, value);
  });
  
  const { error } = await query;
  
  if (error) {
    throw new Error(`Delete failed: ${error.message}`);
  }
  
  return 'Delete successful!';
}

async function listTables() {
  // Try known tables first
  const knownTables = ['categories', 'products', 'bill_history'];
  const availableTables = [];
  
  for (const table of knownTables) {
    try {
      const { error } = await supabase.from(table).select('*').limit(1);
      if (!error) {
        availableTables.push(table);
      }
    } catch (e) {
      // Network error - return known tables as fallback
      if (e.message.includes('fetch failed')) {
        console.error('Network connectivity issue, returning known tables');
        return `Available tables (offline mode): ${knownTables.join(', ')}`;
      }
    }
  }
  
  return availableTables.length > 0 
    ? `Available tables: ${availableTables.join(', ')}`
    : `Available tables (known): ${knownTables.join(', ')}`;
}

async function describeTable({ table }) {
  const { data, error } = await supabase
    .from(table)
    .select('*')
    .limit(1);
  
  if (error) {
    throw new Error(`Failed to describe table: ${error.message}`);
  }
  
  const schema = data.length > 0 ? Object.keys(data[0]) : [];
  
  return `Table: ${table}\nColumns: ${schema.join(', ')}\nSample data:\n${JSON.stringify(data[0] || {}, null, 2)}`;
}

// Handle tool calls
async function handleToolCall(name, args) {
  try {
    switch (name) {
      case 'supabase_query':
        return await executeQuery(args);
      case 'supabase_insert':
        return await insertData(args);
      case 'supabase_update':
        return await updateData(args);
      case 'supabase_delete':
        return await deleteData(args);
      case 'supabase_list_tables':
        return await listTables();
      case 'supabase_describe_table':
        return await describeTable(args);
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    throw error;
  }
}

// MCP Protocol message handlers
function sendResponse(id, result) {
  const response = {
    jsonrpc: '2.0',
    id: id,
    result: result
  };
  process.stdout.write(JSON.stringify(response) + '\n');
}

function sendError(id, code, message) {
  const response = {
    jsonrpc: '2.0',
    id: id,
    error: { code: code, message: message }
  };
  process.stdout.write(JSON.stringify(response) + '\n');
}

// Handle incoming messages
process.stdin.on('data', async (data) => {
  try {
    const lines = data.toString().trim().split('\n');
    
    for (const line of lines) {
      if (!line.trim()) continue;
      
      const message = JSON.parse(line);
      
      switch (message.method) {
        case 'initialize':
          sendResponse(message.id, {
            protocolVersion: '2024-11-05',
            capabilities: {
              tools: { listChanged: true }
            },
            serverInfo: SERVER_INFO
          });
          break;
          
        case 'tools/list':
          sendResponse(message.id, { tools: TOOLS });
          break;
          
        case 'tools/call':
          try {
            const result = await handleToolCall(
              message.params.name,
              message.params.arguments || {}
            );
            sendResponse(message.id, {
              content: [{ type: 'text', text: result }]
            });
          } catch (error) {
            sendError(message.id, -32000, error.message);
          }
          break;
          
        default:
          sendError(message.id, -32601, 'Method not found');
      }
    }
  } catch (error) {
    console.error('Parse error:', error.message);
    sendError(null, -32700, 'Parse error: ' + error.message);
  }
});

// Test connection on startup
async function testConnection() {
  try {
    const { data, error } = await supabase.from('categories').select('count').limit(1);
    console.error(`🔗 Supabase MCP Server ready! Connection: ${error ? 'Failed - ' + error.message : 'Success'}`);
  } catch (err) {
    console.error(`🔗 Supabase MCP Server ready! Connection: Failed - ${err.message}`);
  }
}

// Initialize
testConnection();
process.stdin.resume();
process.stdin.setEncoding('utf8');

console.error('🚀 Supabase MCP Server starting...');
