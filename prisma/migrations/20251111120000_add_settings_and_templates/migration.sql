-- Add settings to users table
ALTER TABLE "users" 
ADD COLUMN IF NOT EXISTS "settings" JSONB DEFAULT '{}';

CREATE INDEX IF NOT EXISTS "users_settings_idx" ON "users" USING GIN ("settings");

-- Create templates table
CREATE TABLE IF NOT EXISTS "conversation_templates" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" TEXT NOT NULL,
  "icon" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "template_text" TEXT NOT NULL,
  "plan_required" TEXT,
  "sort_order" INTEGER DEFAULT 0,
  "is_active" BOOLEAN DEFAULT true,
  "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "conversation_templates_category_idx" ON "conversation_templates"("category");
CREATE INDEX IF NOT EXISTS "conversation_templates_is_active_idx" ON "conversation_templates"("is_active");
CREATE INDEX IF NOT EXISTS "conversation_templates_sort_order_idx" ON "conversation_templates"("sort_order");

-- Seed templates
INSERT INTO "conversation_templates" ("name", "icon", "category", "description", "template_text", "plan_required", "sort_order", "is_active")
VALUES 
  ('Code Review', '💻', 'coding', 'Analyze code quality, bugs, best practices', 'Please review this code for quality, bugs, and best practices:\n\n[Paste your code here]', NULL, 1, true),
  ('Debug Helper', '🐛', 'coding', 'Find and fix bugs, error analysis', 'I''m getting this error and need help debugging:\n\nError: [Paste error message]\n\nCode: [Paste relevant code]', NULL, 2, true),
  ('Learning Mode', '📚', 'education', 'Explain concepts, step-by-step tutorials', 'Please explain this concept in simple terms with examples:\n\n[Topic to learn]', NULL, 3, true),
  ('Business Email', '📧', 'business', 'Professional email drafting', 'Draft a professional email about:\n\n[Purpose of email]', NULL, 4, true),
  ('Creative Writing', '✍️', 'creative', 'Stories, poems, creative content generation', 'Write a creative and engaging story about:\n\n[Describe your idea]', 'PLUS', 5, true),
  ('Brainstorming', '💡', 'creative', 'Generate ideas and solutions', 'Help me brainstorm creative ideas for:\n\n[Your challenge or goal]', 'PLUS', 6, true),
  ('Technical Documentation', '📖', 'professional', 'Write comprehensive technical docs', 'Create detailed technical documentation for:\n\n[Feature/System to document]', 'PRO', 7, true),
  ('Data Analysis', '📊', 'professional', 'Analyze data and provide insights', 'Analyze this data and provide insights:\n\n[Paste data or describe dataset]', 'PRO', 8, true),
  ('Research Assistant', '🔬', 'professional', 'Deep research and analysis', 'Research the following topic in depth:\n\n[Research topic]', 'PRO', 9, true)
ON CONFLICT DO NOTHING;

-- Update trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = CURRENT_TIMESTAMP;
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_conversation_templates_updated_at 
  BEFORE UPDATE ON "conversation_templates"
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();