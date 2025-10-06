-- DropForeignKey
ALTER TABLE "public"."analytics_user" DROP CONSTRAINT "analytics_user_userId_fkey";

-- AddForeignKey
ALTER TABLE "analytics_user" ADD CONSTRAINT "analytics_user_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
