-- CreateTable
CREATE TABLE "chatbot_clients" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "api_key" TEXT NOT NULL,
    "api_key_hash" TEXT NOT NULL,
    "llm_provider" TEXT NOT NULL DEFAULT 'gemini',
    "llm_model" TEXT NOT NULL DEFAULT 'gemini-2.0-flash',
    "system_prompt" TEXT,
    "temperature" DOUBLE PRECISION NOT NULL DEFAULT 0.7,
    "max_tokens" INTEGER NOT NULL DEFAULT 1024,
    "daily_message_limit" INTEGER NOT NULL DEFAULT 1000,
    "monthly_lead_limit" INTEGER NOT NULL DEFAULT 500,
    "widget_config" JSONB,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "chatbot_clients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chatbot_sessions" (
    "id" TEXT NOT NULL,
    "client_id" TEXT NOT NULL,
    "visitor_id" TEXT NOT NULL,
    "visitor_ip" TEXT,
    "user_agent" TEXT,
    "referrer" TEXT,
    "current_page" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_active_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ended_at" TIMESTAMP(3),

    CONSTRAINT "chatbot_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chatbot_messages" (
    "id" TEXT NOT NULL,
    "session_id" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "model" TEXT,
    "prompt_tokens" INTEGER,
    "output_tokens" INTEGER,
    "latency_ms" INTEGER,
    "message_type" TEXT NOT NULL DEFAULT 'text',
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chatbot_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chatbot_leads" (
    "id" TEXT NOT NULL,
    "client_id" TEXT NOT NULL,
    "session_id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "custom_fields" JSONB,
    "score" INTEGER,
    "source" TEXT,
    "status" TEXT NOT NULL DEFAULT 'new',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "chatbot_leads_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "chatbot_clients_slug_key" ON "chatbot_clients"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "chatbot_clients_api_key_key" ON "chatbot_clients"("api_key");

-- CreateIndex
CREATE INDEX "chatbot_sessions_client_id_visitor_id_idx" ON "chatbot_sessions"("client_id", "visitor_id");

-- CreateIndex
CREATE INDEX "chatbot_sessions_client_id_is_active_idx" ON "chatbot_sessions"("client_id", "is_active");

-- CreateIndex
CREATE INDEX "chatbot_messages_session_id_created_at_idx" ON "chatbot_messages"("session_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "chatbot_leads_session_id_key" ON "chatbot_leads"("session_id");

-- CreateIndex
CREATE INDEX "chatbot_leads_client_id_status_idx" ON "chatbot_leads"("client_id", "status");

-- CreateIndex
CREATE INDEX "chatbot_leads_client_id_created_at_idx" ON "chatbot_leads"("client_id", "created_at");

-- AddForeignKey
ALTER TABLE "chatbot_sessions" ADD CONSTRAINT "chatbot_sessions_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "chatbot_clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chatbot_messages" ADD CONSTRAINT "chatbot_messages_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "chatbot_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chatbot_leads" ADD CONSTRAINT "chatbot_leads_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "chatbot_clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chatbot_leads" ADD CONSTRAINT "chatbot_leads_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "chatbot_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
