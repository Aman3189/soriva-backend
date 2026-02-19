-- CreateTable
CREATE TABLE "chatbot_flows" (
    "id" TEXT NOT NULL,
    "client_id" TEXT NOT NULL,
    "trigger" TEXT NOT NULL,
    "keywords" TEXT[],
    "response" TEXT,
    "route" TEXT,
    "options" JSONB,
    "use_ai" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "chatbot_flows_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "chatbot_flows_client_id_trigger_idx" ON "chatbot_flows"("client_id", "trigger");

-- AddForeignKey
ALTER TABLE "chatbot_flows" ADD CONSTRAINT "chatbot_flows_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "chatbot_clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;
