-- ============================================================
-- Migration 004: Upline Manager Links + Comments + Feedback
-- Description: Tables for no-login upline manager access,
--   threaded comments, and viewer feedback
-- ============================================================

-- -----------------------------------------------------------
-- 1. upline_manager_links
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS upline_manager_links (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    token           VARCHAR(40) NOT NULL UNIQUE,
    viewer_name     VARCHAR(255) NOT NULL DEFAULT '',
    viewer_email    VARCHAR(255) NOT NULL DEFAULT '',
    status          VARCHAR(20) NOT NULL DEFAULT 'active'
                        CHECK (status IN ('active', 'revoked')),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    last_accessed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_upline_manager_links_token ON upline_manager_links(token);
CREATE INDEX IF NOT EXISTS idx_upline_manager_links_status ON upline_manager_links(status);

-- -----------------------------------------------------------
-- 2. upline_manager_comments
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS upline_manager_comments (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    upline_manager_link_id  UUID NOT NULL REFERENCES upline_manager_links(id) ON DELETE CASCADE,
    item_type               VARCHAR(100) NOT NULL DEFAULT '',
    item_id                 VARCHAR(255) NOT NULL DEFAULT '',
    author_type             VARCHAR(20) NOT NULL DEFAULT 'upline_manager'
                                CHECK (author_type IN ('ajose', 'upline_manager')),
    author_name             VARCHAR(255) NOT NULL DEFAULT '',
    comment_text            TEXT NOT NULL DEFAULT '',
    parent_comment_id       UUID REFERENCES upline_manager_comments(id) ON DELETE SET NULL,
    status                  VARCHAR(20) NOT NULL DEFAULT 'New'
                                CHECK (status IN ('New', 'Read', 'Actioned')),
    order_key               VARCHAR(500) NOT NULL DEFAULT '',
    created_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_um_comments_link_id ON upline_manager_comments(upline_manager_link_id);
CREATE INDEX IF NOT EXISTS idx_um_comments_order_key ON upline_manager_comments(order_key);
CREATE INDEX IF NOT EXISTS idx_um_comments_item ON upline_manager_comments(item_type, item_id);

-- -----------------------------------------------------------
-- 3. viewer_feedback
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS viewer_feedback (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    viewer_name             VARCHAR(255) NOT NULL DEFAULT '',
    viewer_email            VARCHAR(255) NOT NULL DEFAULT '',
    upline_manager_link_id  UUID REFERENCES upline_manager_links(id) ON DELETE SET NULL,
    page_context            VARCHAR(255) NOT NULL DEFAULT '',
    page_label              VARCHAR(255) NOT NULL DEFAULT '',
    comment_text            TEXT NOT NULL DEFAULT '',
    status                  VARCHAR(20) NOT NULL DEFAULT 'New'
                                CHECK (status IN ('New', 'Read', 'Actioned')),
    ajose_response          TEXT NOT NULL DEFAULT '',
    created_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_viewer_feedback_status ON viewer_feedback(status);
CREATE INDEX IF NOT EXISTS idx_viewer_feedback_link_id ON viewer_feedback(upline_manager_link_id);
