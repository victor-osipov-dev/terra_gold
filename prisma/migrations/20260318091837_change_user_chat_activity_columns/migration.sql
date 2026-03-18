-- AlterTable
ALTER TABLE "UserChatActivity" ADD COLUMN     "role" TEXT,
ADD COLUMN     "role_updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "total_messages" SET DEFAULT 0,
ALTER COLUMN "messages_per_hour" SET DEFAULT 0;
