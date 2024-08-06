-- CreateTable
CREATE TABLE "Movie" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "idGoogleDive" TEXT,
    "tags" TEXT[],
    "link" TEXT NOT NULL,
    "releaseDate" TEXT,
    "year" INTEGER,
    "genre" TEXT[],
    "country" TEXT,
    "synopsis" TEXT,
    "trailer" TEXT,

    CONSTRAINT "Movie_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_UserFavoriteMovies" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Movie_idGoogleDive_key" ON "Movie"("idGoogleDive");

-- CreateIndex
CREATE UNIQUE INDEX "Movie_link_key" ON "Movie"("link");

-- CreateIndex
CREATE UNIQUE INDEX "_UserFavoriteMovies_AB_unique" ON "_UserFavoriteMovies"("A", "B");

-- CreateIndex
CREATE INDEX "_UserFavoriteMovies_B_index" ON "_UserFavoriteMovies"("B");

-- AddForeignKey
ALTER TABLE "_UserFavoriteMovies" ADD CONSTRAINT "_UserFavoriteMovies_A_fkey" FOREIGN KEY ("A") REFERENCES "Movie"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserFavoriteMovies" ADD CONSTRAINT "_UserFavoriteMovies_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
