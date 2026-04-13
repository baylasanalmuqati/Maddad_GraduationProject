-- =============================================================================
-- Maddad Backend - PostgreSQL Schema (code-aligned)
-- =============================================================================
-- This schema matches the currently used SQLAlchemy models in backend/app/models.py
-- and preserves the same table names, column names, enum values, and casing.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- ENUM TYPES
-- ---------------------------------------------------------------------------

CREATE TYPE user_type AS ENUM ('parent', 'child');
CREATE TYPE risk_level AS ENUM ('low', 'medium', 'high');

-- ---------------------------------------------------------------------------
-- HELPER FUNCTION: auto-update updated_at
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ---------------------------------------------------------------------------
-- TABLE: users
-- ---------------------------------------------------------------------------

CREATE TABLE users (
    id                BIGSERIAL    PRIMARY KEY,
    user_type         user_type    NOT NULL,
    email             VARCHAR(255) NOT NULL UNIQUE,
    password_hash     VARCHAR(255) NOT NULL,
    first_name        VARCHAR(100) NOT NULL,
    last_name         VARCHAR(100) NOT NULL,
    date_of_birth     TIMESTAMP,
    phone_number      VARCHAR(20),
    profile_image_url VARCHAR(255),
    is_active         BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at        TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users (email);

CREATE TRIGGER set_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- ---------------------------------------------------------------------------
-- TABLE: parent_profiles
-- ---------------------------------------------------------------------------

CREATE TABLE parent_profiles (
    id              BIGSERIAL    PRIMARY KEY,
    user_id         BIGINT       NOT NULL UNIQUE,
    occupation      VARCHAR(150),
    address         VARCHAR(255),
    city            VARCHAR(100),
    country         VARCHAR(100),
    postal_code     VARCHAR(20),
    bio             TEXT,

    child_name      VARCHAR(100),
    child_age_group VARCHAR(10),
    child_gender    VARCHAR(10),

    CONSTRAINT fk_parent_profiles_user
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,

    CONSTRAINT chk_parent_profiles_child_age_group
        CHECK (
            child_age_group IS NULL
            OR child_age_group IN ('12-18', '19-24', '25-30', '31-36')
        ),
    CONSTRAINT chk_parent_profiles_child_gender
        CHECK (
            child_gender IS NULL
            OR child_gender IN ('ذكر', 'أنثى')
        )
);

-- ---------------------------------------------------------------------------
-- TABLE: sessions
-- ---------------------------------------------------------------------------

CREATE TABLE sessions (
    id            BIGSERIAL    PRIMARY KEY,
    user_id       BIGINT       NOT NULL,
    session_token VARCHAR(255) NOT NULL UNIQUE,
    ip_address    VARCHAR(45),
    user_agent    TEXT,
    expires_at    TIMESTAMPTZ  NOT NULL,
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_sessions_user
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE INDEX idx_sessions_token ON sessions (session_token);
CREATE INDEX idx_sessions_user_expires ON sessions (user_id, expires_at);

-- ---------------------------------------------------------------------------
-- TABLE: questionnaire_results
-- ---------------------------------------------------------------------------

CREATE TABLE questionnaire_results (
    id                    BIGSERIAL   PRIMARY KEY,
    user_id               BIGINT      NOT NULL,
    age_group             VARCHAR(10) NOT NULL,
    gender                VARCHAR(10) NOT NULL,

    response_to_name      SMALLINT    NOT NULL CHECK (response_to_name     IN (0,1)),
    eye_contact           SMALLINT    NOT NULL CHECK (eye_contact          IN (0,1)),
    social_smile          SMALLINT    NOT NULL CHECK (social_smile         IN (0,1)),
    imitation             SMALLINT    NOT NULL CHECK (imitation            IN (0,1)),
    discrimination        SMALLINT    NOT NULL CHECK (discrimination       IN (0,1)),
    pointing_with_finger  SMALLINT    NOT NULL CHECK (pointing_with_finger IN (0,1)),
    facial_expressions    SMALLINT    NOT NULL CHECK (facial_expressions   IN (0,1)),
    joint_attention       SMALLINT    NOT NULL CHECK (joint_attention      IN (0,1)),
    play_skills           SMALLINT    NOT NULL CHECK (play_skills          IN (0,1)),
    response_to_commands  SMALLINT    NOT NULL CHECK (response_to_commands IN (0,1)),

    initial_score         SMALLINT    NOT NULL,
    initial_risk          risk_level  NOT NULL,

    followup_answers      JSONB,
    final_score           SMALLINT,
    final_risk            risk_level,

    ml_risk               risk_level,
    ml_confidence         DOUBLE PRECISION,

    created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_questionnaire_results_user
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,

    CONSTRAINT chk_questionnaire_age_group
        CHECK (age_group IN ('12-18', '19-24', '25-30', '31-36')),
    CONSTRAINT chk_questionnaire_gender
        CHECK (gender IN ('ذكر', 'أنثى'))
);

CREATE INDEX idx_qr_user_created ON questionnaire_results (user_id, created_at DESC);
