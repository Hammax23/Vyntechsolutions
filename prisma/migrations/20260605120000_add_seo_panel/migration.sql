-- CreateTable
CREATE TABLE "SeoSession" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SeoSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SeoKeyword" (
    "id" TEXT NOT NULL,
    "keyword" TEXT NOT NULL,
    "targetUrl" TEXT,
    "currentRank" INTEGER,
    "previousRank" INTEGER,
    "bestRank" INTEGER,
    "searchVolume" INTEGER,
    "difficulty" INTEGER,
    "priority" TEXT NOT NULL DEFAULT 'medium',
    "status" TEXT NOT NULL DEFAULT 'tracking',
    "country" TEXT NOT NULL DEFAULT 'CA',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SeoKeyword_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SeoRankHistory" (
    "id" TEXT NOT NULL,
    "keywordId" TEXT NOT NULL,
    "rank" INTEGER NOT NULL,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SeoRankHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SeoPage" (
    "id" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "title" TEXT,
    "metaDescription" TEXT,
    "h1" TEXT,
    "canonicalUrl" TEXT,
    "ogTitle" TEXT,
    "ogDescription" TEXT,
    "ogImage" TEXT,
    "focusKeyword" TEXT,
    "seoScore" INTEGER NOT NULL DEFAULT 0,
    "indexStatus" TEXT NOT NULL DEFAULT 'index',
    "status" TEXT NOT NULL DEFAULT 'needs_review',
    "lastAuditedAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SeoPage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SeoBacklink" (
    "id" TEXT NOT NULL,
    "sourceUrl" TEXT NOT NULL,
    "targetUrl" TEXT NOT NULL,
    "anchorText" TEXT,
    "domainAuth" INTEGER,
    "linkType" TEXT NOT NULL DEFAULT 'dofollow',
    "status" TEXT NOT NULL DEFAULT 'active',
    "acquiredAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SeoBacklink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SeoTask" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL DEFAULT 'general',
    "priority" TEXT NOT NULL DEFAULT 'medium',
    "status" TEXT NOT NULL DEFAULT 'pending',
    "dueDate" TIMESTAMP(3),
    "assignee" TEXT NOT NULL DEFAULT 'SEO Expert',
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SeoTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SeoAudit" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "auditType" TEXT NOT NULL DEFAULT 'full',
    "score" INTEGER NOT NULL DEFAULT 0,
    "findings" TEXT,
    "recommendations" TEXT,
    "status" TEXT NOT NULL DEFAULT 'completed',
    "auditedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SeoAudit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SeoCompetitor" (
    "id" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "name" TEXT,
    "domainAuth" INTEGER,
    "topKeywords" TEXT[],
    "strengths" TEXT,
    "weaknesses" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SeoCompetitor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SeoTechnicalIssue" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "severity" TEXT NOT NULL DEFAULT 'medium',
    "category" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'open',
    "affectedUrl" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SeoTechnicalIssue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SeoContentBrief" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "targetUrl" TEXT,
    "targetKeyword" TEXT,
    "wordCount" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "brief" TEXT,
    "outline" TEXT,
    "notes" TEXT,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SeoContentBrief_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SeoReport" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "reportType" TEXT NOT NULL DEFAULT 'monthly',
    "summary" TEXT,
    "metrics" TEXT,
    "highlights" TEXT,
    "challenges" TEXT,
    "nextSteps" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SeoReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SeoSettings" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "siteUrl" TEXT NOT NULL DEFAULT 'https://vyntechsolutions.ca',
    "gscProperty" TEXT,
    "gaPropertyId" TEXT,
    "googleVerification" TEXT,
    "bingVerification" TEXT,
    "defaultTitle" TEXT,
    "defaultDescription" TEXT,
    "robotsTxtNotes" TEXT,
    "sitemapLastSubmitted" TIMESTAMP(3),
    "targetCountry" TEXT NOT NULL DEFAULT 'CA',
    "targetCities" TEXT[],
    "monthlyTrafficGoal" INTEGER,
    "monthlyLeadsGoal" INTEGER,
    "notes" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SeoSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SeoActivityLog" (
    "id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "module" TEXT NOT NULL,
    "details" TEXT,
    "user" TEXT NOT NULL DEFAULT 'SEO Expert',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SeoActivityLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SeoSession_token_key" ON "SeoSession"("token");

-- CreateIndex
CREATE INDEX "SeoSession_token_idx" ON "SeoSession"("token");

-- CreateIndex
CREATE INDEX "SeoSession_email_idx" ON "SeoSession"("email");

-- CreateIndex
CREATE INDEX "SeoRankHistory_keywordId_idx" ON "SeoRankHistory"("keywordId");

-- CreateIndex
CREATE UNIQUE INDEX "SeoPage_path_key" ON "SeoPage"("path");

-- CreateIndex
CREATE INDEX "SeoActivityLog_createdAt_idx" ON "SeoActivityLog"("createdAt");

-- AddForeignKey
ALTER TABLE "SeoRankHistory" ADD CONSTRAINT "SeoRankHistory_keywordId_fkey" FOREIGN KEY ("keywordId") REFERENCES "SeoKeyword"("id") ON DELETE CASCADE ON UPDATE CASCADE;
