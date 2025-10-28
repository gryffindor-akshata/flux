import { readFileSync } from 'fs'
import { join } from 'path'
import { db } from './connection'

async function migrate() {
  try {
    console.log('🔄 Starting database migration...')
    
    // Read schema file
    const schemaPath = join(__dirname, 'schema.sql')
    const schema = readFileSync(schemaPath, 'utf8')
    
    // Execute schema
    await db.query(schema)
    
    console.log('✅ Database migration completed successfully')
    
    // Create default agent for testing
    const agentResult = await db.query(`
      INSERT INTO agents (name, api_key, trust_score) 
      VALUES ('TravelGPT', 'flux_live_test_agent_123', 0.8)
      ON CONFLICT (api_key) DO NOTHING
      RETURNING id
    `)
    
    if (agentResult.rows.length > 0) {
      console.log('✅ Created default test agent')
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error)
    throw error
  } finally {
    await db.end()
  }
}

if (require.main === module) {
  migrate()
    .then(() => {
      console.log('🎉 Migration completed')
      process.exit(0)
    })
    .catch((error) => {
      console.error('💥 Migration failed:', error)
      process.exit(1)
    })
}

export { migrate }
