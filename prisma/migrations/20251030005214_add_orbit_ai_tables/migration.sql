-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- ORBIT AI TABLES
-- Tables for AI-powered orbit suggestions and learning system
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- Table: orbit_suggestions (Track suggestion history)
CREATE TABLE IF NOT EXISTS orbit_suggestions (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  conversation_id VARCHAR(255) NOT NULL,
  suggested_orbit_id VARCHAR(255) NOT NULL,
  confidence DECIMAL(3,2) DEFAULT 0.00,
  user_choice VARCHAR(20), -- 'accepted', 'rejected', 'different', null
  selected_orbit_id VARCHAR(255), -- if user chose different orbit
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_orbit_suggestions_user 
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_orbit_suggestions_orbit 
    FOREIGN KEY (suggested_orbit_id) REFERENCES orbits(id) ON DELETE CASCADE,
  CONSTRAINT fk_orbit_suggestions_selected_orbit 
    FOREIGN KEY (selected_orbit_id) REFERENCES orbits(id) ON DELETE SET NULL
);

-- Table: orbit_keywords (Learn keywords from user behavior)
CREATE TABLE IF NOT EXISTS orbit_keywords (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  orbit_id VARCHAR(255) NOT NULL,
  keyword VARCHAR(100) NOT NULL,
  weight DECIMAL(3,2) DEFAULT 1.00,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_orbit_keywords_user 
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_orbit_keywords_orbit 
    FOREIGN KEY (orbit_id) REFERENCES orbits(id) ON DELETE CASCADE,
    
  UNIQUE KEY unique_user_orbit_keyword (user_id, orbit_id, keyword)
);

-- Indexes for performance
CREATE INDEX idx_orbit_suggestions_user ON orbit_suggestions(user_id);
CREATE INDEX idx_orbit_suggestions_conversation ON orbit_suggestions(conversation_id);
CREATE INDEX idx_orbit_suggestions_choice ON orbit_suggestions(user_choice);
CREATE INDEX idx_orbit_keywords_user_orbit ON orbit_keywords(user_id, orbit_id);
CREATE INDEX idx_orbit_keywords_keyword ON orbit_keywords(keyword);

-- Comments
COMMENT ON TABLE orbit_suggestions IS 'Tracks AI suggestions and user feedback for learning';
COMMENT ON TABLE orbit_keywords IS 'Learned keywords for each orbit based on user behavior';