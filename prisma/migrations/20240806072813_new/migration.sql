/*
  Warnings:

  - You are about to drop the `_UserFavoriteMovies` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_UserFavoriteMovies" DROP CONSTRAINT "_UserFavoriteMovies_A_fkey";

-- DropForeignKey
ALTER TABLE "_UserFavoriteMovies" DROP CONSTRAINT "_UserFavoriteMovies_B_fkey";

-- DropTable
DROP TABLE "_UserFavoriteMovies";

-- CreateTable
CREATE TABLE "UserFavoriteMovies" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "movieId" TEXT NOT NULL,

    CONSTRAINT "UserFavoriteMovies_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserFavoriteMovies_userId_movieId_key" ON "UserFavoriteMovies"("userId", "movieId");

-- AddForeignKey
ALTER TABLE "UserFavoriteMovies" ADD CONSTRAINT "UserFavoriteMovies_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserFavoriteMovies" ADD CONSTRAINT "UserFavoriteMovies_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES "Movie"("id") ON DELETE CASCADE ON UPDATE CASCADE;
