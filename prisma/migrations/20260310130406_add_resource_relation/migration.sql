-- AlterTable
ALTER TABLE "Chat" ADD COLUMN     "resource_id" BIGINT NOT NULL DEFAULT 1;

-- AddForeignKey
ALTER TABLE "Chat" ADD CONSTRAINT "Chat_resource_id_fkey" FOREIGN KEY ("resource_id") REFERENCES "Resource"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
