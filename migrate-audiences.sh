#!/bin/bash

# Database Migration Script
# Adds the audiences column to the documents table for role-based retrieval

echo "🔧 Adding audiences column to documents table..."

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ Error: DATABASE_URL environment variable is not set"
    echo "Please set your database connection string:"
    echo "export DATABASE_URL='postgresql://username:password@host:port/database'"
    exit 1
fi

# Run the migration
psql "$DATABASE_URL" -c "
    -- Add audiences column if it doesn't exist
    ALTER TABLE documents ADD COLUMN IF NOT EXISTS audiences text[] DEFAULT ARRAY['general'];
    
    -- Create index for audience-based filtering
    CREATE INDEX IF NOT EXISTS idx_documents_audiences ON documents USING GIN(audiences);
    
    -- Update existing documents with general audience tag
    UPDATE documents SET audiences = ARRAY['general'] WHERE audiences IS NULL;
    
    -- Show the updated schema
    \d documents
"

if [ $? -eq 0 ]; then
    echo "✅ Migration completed successfully!"
    echo ""
    echo "Next steps:"
    echo "1. Re-run the ingestion script to tag documents with audiences:"
    echo "   pnpm tsx scripts/ingest.ts"
    echo ""
    echo "2. Test the role-based search in the assistant"
else
    echo "❌ Migration failed. Please check your database connection."
    exit 1
fi
