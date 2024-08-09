-- AlterTable
ALTER TABLE "Movie" ADD COLUMN     "originalTitle" TEXT;

-- CreateTable
CREATE TABLE "AuthorizedEmail" (
    "id" TEXT NOT NULL,
    "email" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "AuthorizedEmail_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AuthorizedEmail_email_key" ON "AuthorizedEmail"("email");

-- CreateIndex
CREATE UNIQUE INDEX "AuthorizedEmail_userId_email_key" ON "AuthorizedEmail"("userId", "email");

-- AddForeignKey
ALTER TABLE "AuthorizedEmail" ADD CONSTRAINT "AuthorizedEmail_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
