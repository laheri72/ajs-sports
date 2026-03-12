# 1Tables :
| table_schema        | table_name                  |
| ------------------- | --------------------------- |
| auth                | audit_log_entries           |
| auth                | custom_oauth_providers      |
| auth                | flow_state                  |
| auth                | identities                  |
| auth                | instances                   |
| auth                | mfa_amr_claims              |
| auth                | mfa_challenges              |
| auth                | mfa_factors                 |
| auth                | oauth_authorizations        |
| auth                | oauth_client_states         |
| auth                | oauth_clients               |
| auth                | oauth_consents              |
| auth                | one_time_tokens             |
| auth                | refresh_tokens              |
| auth                | saml_providers              |
| auth                | saml_relay_states           |
| auth                | schema_migrations           |
| auth                | sessions                    |
| auth                | sso_domains                 |
| auth                | sso_providers               |
| auth                | users                       |
| extensions          | pg_stat_statements          |
| extensions          | pg_stat_statements_info     |
| public              | achievements                |
| public              | certifications              |
| public              | club_event_participants     |
| public              | club_events                 |
| public              | club_members                |
| public              | clubs                       |
| public              | events                      |
| public              | fitness_logs                |
| public              | hizb                        |
| public              | house_leaderboard_view      |
| public              | houses                      |
| public              | match_request_players       |
| public              | match_requests              |
| public              | matches                     |
| public              | participations              |
| public              | point_transactions          |
| public              | profiles                    |
| public              | seasons                     |
| public              | sport_self_assessments      |
| public              | sports                      |
| public              | sports_interests            |
| public              | student_event_roles         |
| public              | student_rankings_view       |
| public              | student_selections          |
| public              | student_sport_proficiencies |
| public              | student_sport_scores        |
| public              | team_members                |
| public              | team_standings              |
| public              | teams                       |
| public              | temp_student_houses         |
| public              | training_attendance         |
| public              | trainings                   |
| public              | user_roles                  |
| public              | wildcard_programs           |
| realtime            | messages                    |
| realtime            | messages_2026_03_10         |
| realtime            | messages_2026_03_11         |
| realtime            | messages_2026_03_12         |
| realtime            | messages_2026_03_13         |
| realtime            | messages_2026_03_14         |
| realtime            | schema_migrations           |
| realtime            | subscription                |
| storage             | buckets                     |
| storage             | buckets_analytics           |
| storage             | buckets_vectors             |
| storage             | migrations                  |
| storage             | objects                     |
| storage             | s3_multipart_uploads        |
| storage             | s3_multipart_uploads_parts  |
| storage             | vector_indexes              |
| supabase_migrations | schema_migrations           |
| vault               | decrypted_secrets           |
| vault               | secrets                     |

# 2 All Columns :
| table_schema        | table_name                  | column_name                  | data_type                   | is_nullable | column_default                                  |
| ------------------- | --------------------------- | ---------------------------- | --------------------------- | ----------- | ----------------------------------------------- |
| public              | achievements                | id                           | uuid                        | NO          | gen_random_uuid()                               |
| public              | achievements                | student_tr                   | text                        | NO          | null                                            |
| public              | achievements                | title                        | text                        | NO          | null                                            |
| public              | achievements                | description                  | text                        | YES         | null                                            |
| public              | achievements                | icon                         | text                        | YES         | null                                            |
| public              | achievements                | earned_at                    | timestamp with time zone    | YES         | now()                                           |
| auth                | audit_log_entries           | instance_id                  | uuid                        | YES         | null                                            |
| auth                | audit_log_entries           | id                           | uuid                        | NO          | null                                            |
| auth                | audit_log_entries           | payload                      | json                        | YES         | null                                            |
| auth                | audit_log_entries           | created_at                   | timestamp with time zone    | YES         | null                                            |
| auth                | audit_log_entries           | ip_address                   | character varying           | NO          | ''::character varying                           |
| storage             | buckets                     | id                           | text                        | NO          | null                                            |
| storage             | buckets                     | name                         | text                        | NO          | null                                            |
| storage             | buckets                     | owner                        | uuid                        | YES         | null                                            |
| storage             | buckets                     | created_at                   | timestamp with time zone    | YES         | now()                                           |
| storage             | buckets                     | updated_at                   | timestamp with time zone    | YES         | now()                                           |
| storage             | buckets                     | public                       | boolean                     | YES         | false                                           |
| storage             | buckets                     | avif_autodetection           | boolean                     | YES         | false                                           |
| storage             | buckets                     | file_size_limit              | bigint                      | YES         | null                                            |
| storage             | buckets                     | allowed_mime_types           | ARRAY                       | YES         | null                                            |
| storage             | buckets                     | owner_id                     | text                        | YES         | null                                            |
| storage             | buckets                     | type                         | USER-DEFINED                | NO          | 'STANDARD'::storage.buckettype                  |
| storage             | buckets_analytics           | name                         | text                        | NO          | null                                            |
| storage             | buckets_analytics           | type                         | USER-DEFINED                | NO          | 'ANALYTICS'::storage.buckettype                 |
| storage             | buckets_analytics           | format                       | text                        | NO          | 'ICEBERG'::text                                 |
| storage             | buckets_analytics           | created_at                   | timestamp with time zone    | NO          | now()                                           |
| storage             | buckets_analytics           | updated_at                   | timestamp with time zone    | NO          | now()                                           |
| storage             | buckets_analytics           | id                           | uuid                        | NO          | gen_random_uuid()                               |
| storage             | buckets_analytics           | deleted_at                   | timestamp with time zone    | YES         | null                                            |
| storage             | buckets_vectors             | id                           | text                        | NO          | null                                            |
| storage             | buckets_vectors             | type                         | USER-DEFINED                | NO          | 'VECTOR'::storage.buckettype                    |
| storage             | buckets_vectors             | created_at                   | timestamp with time zone    | NO          | now()                                           |
| storage             | buckets_vectors             | updated_at                   | timestamp with time zone    | NO          | now()                                           |
| public              | certifications              | id                           | uuid                        | NO          | gen_random_uuid()                               |
| public              | certifications              | student_id                   | uuid                        | NO          | null                                            |
| public              | certifications              | sport_id                     | uuid                        | NO          | null                                            |
| public              | certifications              | score_snapshot               | integer                     | NO          | 0                                               |
| public              | certifications              | proficiency_level            | USER-DEFINED                | NO          | 'beginner'::proficiency_level                   |
| public              | certifications              | certificate_number           | text                        | NO          | null                                            |
| public              | certifications              | issued_by                    | uuid                        | YES         | null                                            |
| public              | certifications              | issued_at                    | timestamp with time zone    | YES         | now()                                           |
| public              | certifications              | valid_year                   | integer                     | NO          | null                                            |
| public              | certifications              | notes                        | text                        | YES         | null                                            |
| public              | certifications              | status                       | USER-DEFINED                | NO          | 'draft'::certification_status                   |
| public              | certifications              | created_at                   | timestamp with time zone    | NO          | now()                                           |
| public              | club_event_participants     | id                           | uuid                        | NO          | gen_random_uuid()                               |
| public              | club_event_participants     | club_event_id                | uuid                        | NO          | null                                            |
| public              | club_event_participants     | student_id                   | uuid                        | NO          | null                                            |
| public              | club_event_participants     | status                       | USER-DEFINED                | NO          | 'registered'::club_event_participant_status     |
| public              | club_event_participants     | joined_at                    | timestamp with time zone    | NO          | now()                                           |
| public              | club_events                 | id                           | uuid                        | NO          | gen_random_uuid()                               |
| public              | club_events                 | club_id                      | uuid                        | NO          | null                                            |
| public              | club_events                 | title                        | text                        | NO          | null                                            |
| public              | club_events                 | description                  | text                        | YES         | null                                            |
| public              | club_events                 | event_type                   | USER-DEFINED                | NO          | 'practice'::club_event_type                     |
| public              | club_events                 | event_date                   | timestamp with time zone    | YES         | null                                            |
| public              | club_events                 | location                     | text                        | YES         | null                                            |
| public              | club_events                 | max_participants             | integer                     | YES         | null                                            |
| public              | club_events                 | created_by                   | uuid                        | YES         | null                                            |
| public              | club_events                 | created_at                   | timestamp with time zone    | NO          | now()                                           |
| public              | club_members                | id                           | uuid                        | NO          | gen_random_uuid()                               |
| public              | club_members                | club_id                      | uuid                        | NO          | null                                            |
| public              | club_members                | student_id                   | uuid                        | NO          | null                                            |
| public              | club_members                | role                         | USER-DEFINED                | NO          | 'member'::club_member_role                      |
| public              | club_members                | status                       | USER-DEFINED                | NO          | 'active'::club_member_status                    |
| public              | club_members                | joined_at                    | timestamp with time zone    | NO          | now()                                           |
| public              | clubs                       | id                           | uuid                        | NO          | gen_random_uuid()                               |
| public              | clubs                       | sport_id                     | uuid                        | NO          | null                                            |
| public              | clubs                       | name                         | text                        | NO          | null                                            |
| public              | clubs                       | description                  | text                        | YES         | null                                            |
| public              | clubs                       | incharge_id                  | uuid                        | YES         | null                                            |
| public              | clubs                       | sub_incharge_id              | uuid                        | YES         | null                                            |
| public              | clubs                       | created_by                   | uuid                        | YES         | null                                            |
| public              | clubs                       | is_active                    | boolean                     | NO          | true                                            |
| public              | clubs                       | created_at                   | timestamp with time zone    | NO          | now()                                           |
| auth                | custom_oauth_providers      | id                           | uuid                        | NO          | gen_random_uuid()                               |
| auth                | custom_oauth_providers      | provider_type                | text                        | NO          | null                                            |
| auth                | custom_oauth_providers      | identifier                   | text                        | NO          | null                                            |
| auth                | custom_oauth_providers      | name                         | text                        | NO          | null                                            |
| auth                | custom_oauth_providers      | client_id                    | text                        | NO          | null                                            |
| auth                | custom_oauth_providers      | client_secret                | text                        | NO          | null                                            |
| auth                | custom_oauth_providers      | acceptable_client_ids        | ARRAY                       | NO          | '{}'::text[]                                    |
| auth                | custom_oauth_providers      | scopes                       | ARRAY                       | NO          | '{}'::text[]                                    |
| auth                | custom_oauth_providers      | pkce_enabled                 | boolean                     | NO          | true                                            |
| auth                | custom_oauth_providers      | attribute_mapping            | jsonb                       | NO          | '{}'::jsonb                                     |
| auth                | custom_oauth_providers      | authorization_params         | jsonb                       | NO          | '{}'::jsonb                                     |
| auth                | custom_oauth_providers      | enabled                      | boolean                     | NO          | true                                            |
| auth                | custom_oauth_providers      | email_optional               | boolean                     | NO          | false                                           |
| auth                | custom_oauth_providers      | issuer                       | text                        | YES         | null                                            |
| auth                | custom_oauth_providers      | discovery_url                | text                        | YES         | null                                            |
| auth                | custom_oauth_providers      | skip_nonce_check             | boolean                     | NO          | false                                           |
| auth                | custom_oauth_providers      | cached_discovery             | jsonb                       | YES         | null                                            |
| auth                | custom_oauth_providers      | discovery_cached_at          | timestamp with time zone    | YES         | null                                            |
| auth                | custom_oauth_providers      | authorization_url            | text                        | YES         | null                                            |
| auth                | custom_oauth_providers      | token_url                    | text                        | YES         | null                                            |
| auth                | custom_oauth_providers      | userinfo_url                 | text                        | YES         | null                                            |
| auth                | custom_oauth_providers      | jwks_uri                     | text                        | YES         | null                                            |
| auth                | custom_oauth_providers      | created_at                   | timestamp with time zone    | NO          | now()                                           |
| auth                | custom_oauth_providers      | updated_at                   | timestamp with time zone    | NO          | now()                                           |
| vault               | decrypted_secrets           | id                           | uuid                        | YES         | null                                            |
| vault               | decrypted_secrets           | name                         | text                        | YES         | null                                            |
| vault               | decrypted_secrets           | description                  | text                        | YES         | null                                            |
| vault               | decrypted_secrets           | secret                       | text                        | YES         | null                                            |
| vault               | decrypted_secrets           | decrypted_secret             | text                        | YES         | null                                            |
| vault               | decrypted_secrets           | key_id                       | uuid                        | YES         | null                                            |
| vault               | decrypted_secrets           | nonce                        | bytea                       | YES         | null                                            |
| vault               | decrypted_secrets           | created_at                   | timestamp with time zone    | YES         | null                                            |
| vault               | decrypted_secrets           | updated_at                   | timestamp with time zone    | YES         | null                                            |
| public              | events                      | id                           | uuid                        | NO          | gen_random_uuid()                               |
| public              | events                      | sport_id                     | uuid                        | NO          | null                                            |
| public              | events                      | season_id                    | uuid                        | NO          | null                                            |
| public              | events                      | name                         | text                        | NO          | null                                            |
| public              | events                      | sub_category                 | text                        | YES         | null                                            |
| public              | events                      | level                        | USER-DEFINED                | YES         | 'standard'::event_level                         |
| public              | events                      | age_group                    | text                        | YES         | null                                            |
| public              | events                      | quota_per_house              | integer                     | NO          | 0                                               |
| public              | events                      | playing_lineup               | integer                     | YES         | 0                                               |
| public              | events                      | reserved_u18                 | integer                     | YES         | 0                                               |
| public              | events                      | substitutes                  | integer                     | YES         | 0                                               |
| public              | events                      | total_players                | integer                     | YES         | 0                                               |
| public              | events                      | group_stage_desc             | text                        | YES         | null                                            |
| public              | events                      | playoff_desc                 | text                        | YES         | null                                            |
| public              | events                      | points_1st                   | integer                     | YES         | 0                                               |
| public              | events                      | points_2nd                   | integer                     | YES         | 0                                               |
| public              | events                      | points_3rd                   | integer                     | YES         | 0                                               |
| public              | events                      | points_4th                   | integer                     | YES         | 0                                               |
| public              | events                      | participation_points         | integer                     | YES         | 0                                               |
| public              | events                      | is_team_event                | boolean                     | YES         | false                                           |
| public              | events                      | created_at                   | timestamp with time zone    | YES         | now()                                           |
| public              | events                      | top_8_points                 | integer                     | YES         | 0                                               |
| public              | fitness_logs                | id                           | uuid                        | NO          | gen_random_uuid()                               |
| public              | fitness_logs                | student_tr                   | text                        | NO          | null                                            |
| public              | fitness_logs                | speed                        | numeric                     | YES         | null                                            |
| public              | fitness_logs                | agility                      | numeric                     | YES         | null                                            |
| public              | fitness_logs                | endurance                    | numeric                     | YES         | null                                            |
| public              | fitness_logs                | strength                     | numeric                     | YES         | null                                            |
| public              | fitness_logs                | flexibility                  | numeric                     | YES         | null                                            |
| public              | fitness_logs                | logged_at                    | timestamp with time zone    | YES         | now()                                           |
| auth                | flow_state                  | id                           | uuid                        | NO          | null                                            |
| auth                | flow_state                  | user_id                      | uuid                        | YES         | null                                            |
| auth                | flow_state                  | auth_code                    | text                        | YES         | null                                            |
| auth                | flow_state                  | code_challenge_method        | USER-DEFINED                | YES         | null                                            |
| auth                | flow_state                  | code_challenge               | text                        | YES         | null                                            |
| auth                | flow_state                  | provider_type                | text                        | NO          | null                                            |
| auth                | flow_state                  | provider_access_token        | text                        | YES         | null                                            |
| auth                | flow_state                  | provider_refresh_token       | text                        | YES         | null                                            |
| auth                | flow_state                  | created_at                   | timestamp with time zone    | YES         | null                                            |
| auth                | flow_state                  | updated_at                   | timestamp with time zone    | YES         | null                                            |
| auth                | flow_state                  | authentication_method        | text                        | NO          | null                                            |
| auth                | flow_state                  | auth_code_issued_at          | timestamp with time zone    | YES         | null                                            |
| auth                | flow_state                  | invite_token                 | text                        | YES         | null                                            |
| auth                | flow_state                  | referrer                     | text                        | YES         | null                                            |
| auth                | flow_state                  | oauth_client_state_id        | uuid                        | YES         | null                                            |
| auth                | flow_state                  | linking_target_id            | uuid                        | YES         | null                                            |
| auth                | flow_state                  | email_optional               | boolean                     | NO          | false                                           |
| public              | hizb                        | id                           | uuid                        | NO          | gen_random_uuid()                               |
| public              | hizb                        | name                         | text                        | NO          | null                                            |
| public              | hizb                        | house_id                     | uuid                        | NO          | null                                            |
| public              | hizb                        | created_at                   | timestamp with time zone    | YES         | now()                                           |
| public              | house_leaderboard_view      | season_id                    | uuid                        | YES         | null                                            |
| public              | house_leaderboard_view      | house_id                     | uuid                        | YES         | null                                            |
| public              | house_leaderboard_view      | house_name                   | text                        | YES         | null                                            |
| public              | house_leaderboard_view      | house_color                  | text                        | YES         | null                                            |
| public              | house_leaderboard_view      | total_points                 | integer                     | YES         | null                                            |
| public              | house_leaderboard_view      | placement_points             | integer                     | YES         | null                                            |
| public              | house_leaderboard_view      | participation_points         | integer                     | YES         | null                                            |
| public              | house_leaderboard_view      | bonus_points                 | integer                     | YES         | null                                            |
| public              | house_leaderboard_view      | member_count                 | integer                     | YES         | null                                            |
| public              | houses                      | id                           | uuid                        | NO          | gen_random_uuid()                               |
| public              | houses                      | name                         | text                        | NO          | null                                            |
| public              | houses                      | color                        | text                        | NO          | null                                            |
| public              | houses                      | created_at                   | timestamp with time zone    | YES         | now()                                           |
| auth                | identities                  | provider_id                  | text                        | NO          | null                                            |
| auth                | identities                  | user_id                      | uuid                        | NO          | null                                            |
| auth                | identities                  | identity_data                | jsonb                       | NO          | null                                            |
| auth                | identities                  | provider                     | text                        | NO          | null                                            |
| auth                | identities                  | last_sign_in_at              | timestamp with time zone    | YES         | null                                            |
| auth                | identities                  | created_at                   | timestamp with time zone    | YES         | null                                            |
| auth                | identities                  | updated_at                   | timestamp with time zone    | YES         | null                                            |
| auth                | identities                  | email                        | text                        | YES         | null                                            |
| auth                | identities                  | id                           | uuid                        | NO          | gen_random_uuid()                               |
| auth                | instances                   | id                           | uuid                        | NO          | null                                            |
| auth                | instances                   | uuid                         | uuid                        | YES         | null                                            |
| auth                | instances                   | raw_base_config              | text                        | YES         | null                                            |
| auth                | instances                   | created_at                   | timestamp with time zone    | YES         | null                                            |
| auth                | instances                   | updated_at                   | timestamp with time zone    | YES         | null                                            |
| public              | match_request_players       | id                           | uuid                        | NO          | gen_random_uuid()                               |
| public              | match_request_players       | request_id                   | uuid                        | NO          | null                                            |
| public              | match_request_players       | student_id                   | uuid                        | NO          | null                                            |
| public              | match_request_players       | joined_at                    | timestamp with time zone    | NO          | now()                                           |
| public              | match_requests              | id                           | uuid                        | NO          | gen_random_uuid()                               |
| public              | match_requests              | sport_id                     | uuid                        | NO          | null                                            |
| public              | match_requests              | created_by                   | uuid                        | NO          | null                                            |
| public              | match_requests              | title                        | text                        | NO          | null                                            |
| public              | match_requests              | description                  | text                        | YES         | null                                            |
| public              | match_requests              | event_date                   | timestamp with time zone    | YES         | null                                            |
| public              | match_requests              | location                     | text                        | YES         | null                                            |
| public              | match_requests              | max_players                  | integer                     | NO          | 10                                              |
| public              | match_requests              | status                       | USER-DEFINED                | NO          | 'open'::match_request_status                    |
| public              | match_requests              | created_at                   | timestamp with time zone    | NO          | now()                                           |
| public              | matches                     | id                           | uuid                        | NO          | gen_random_uuid()                               |
| public              | matches                     | season_id                    | uuid                        | NO          | null                                            |
| public              | matches                     | event_id                     | uuid                        | NO          | null                                            |
| public              | matches                     | match_date                   | timestamp with time zone    | YES         | null                                            |
| public              | matches                     | stage                        | USER-DEFINED                | YES         | 'group'::match_stage                            |
| public              | matches                     | home_team_id                 | uuid                        | YES         | null                                            |
| public              | matches                     | away_team_id                 | uuid                        | YES         | null                                            |
| public              | matches                     | home_score                   | numeric                     | YES         | null                                            |
| public              | matches                     | away_score                   | numeric                     | YES         | null                                            |
| public              | matches                     | winner_team_id               | uuid                        | YES         | null                                            |
| public              | matches                     | home_runs_for                | numeric                     | YES         | null                                            |
| public              | matches                     | home_overs_faced             | numeric                     | YES         | null                                            |
| public              | matches                     | away_runs_for                | numeric                     | YES         | null                                            |
| public              | matches                     | away_overs_faced             | numeric                     | YES         | null                                            |
| public              | matches                     | created_at                   | timestamp with time zone    | YES         | now()                                           |
| realtime            | messages                    | topic                        | text                        | NO          | null                                            |
| realtime            | messages                    | extension                    | text                        | NO          | null                                            |
| realtime            | messages                    | payload                      | jsonb                       | YES         | null                                            |
| realtime            | messages                    | event                        | text                        | YES         | null                                            |
| realtime            | messages                    | private                      | boolean                     | YES         | false                                           |
| realtime            | messages                    | updated_at                   | timestamp without time zone | NO          | now()                                           |
| realtime            | messages                    | inserted_at                  | timestamp without time zone | NO          | now()                                           |
| realtime            | messages                    | id                           | uuid                        | NO          | gen_random_uuid()                               |
| realtime            | messages_2026_03_10         | topic                        | text                        | NO          | null                                            |
| realtime            | messages_2026_03_10         | extension                    | text                        | NO          | null                                            |
| realtime            | messages_2026_03_10         | payload                      | jsonb                       | YES         | null                                            |
| realtime            | messages_2026_03_10         | event                        | text                        | YES         | null                                            |
| realtime            | messages_2026_03_10         | private                      | boolean                     | YES         | false                                           |
| realtime            | messages_2026_03_10         | updated_at                   | timestamp without time zone | NO          | now()                                           |
| realtime            | messages_2026_03_10         | inserted_at                  | timestamp without time zone | NO          | now()                                           |
| realtime            | messages_2026_03_10         | id                           | uuid                        | NO          | gen_random_uuid()                               |
| realtime            | messages_2026_03_11         | topic                        | text                        | NO          | null                                            |
| realtime            | messages_2026_03_11         | extension                    | text                        | NO          | null                                            |
| realtime            | messages_2026_03_11         | payload                      | jsonb                       | YES         | null                                            |
| realtime            | messages_2026_03_11         | event                        | text                        | YES         | null                                            |
| realtime            | messages_2026_03_11         | private                      | boolean                     | YES         | false                                           |
| realtime            | messages_2026_03_11         | updated_at                   | timestamp without time zone | NO          | now()                                           |
| realtime            | messages_2026_03_11         | inserted_at                  | timestamp without time zone | NO          | now()                                           |
| realtime            | messages_2026_03_11         | id                           | uuid                        | NO          | gen_random_uuid()                               |
| realtime            | messages_2026_03_12         | topic                        | text                        | NO          | null                                            |
| realtime            | messages_2026_03_12         | extension                    | text                        | NO          | null                                            |
| realtime            | messages_2026_03_12         | payload                      | jsonb                       | YES         | null                                            |
| realtime            | messages_2026_03_12         | event                        | text                        | YES         | null                                            |
| realtime            | messages_2026_03_12         | private                      | boolean                     | YES         | false                                           |
| realtime            | messages_2026_03_12         | updated_at                   | timestamp without time zone | NO          | now()                                           |
| realtime            | messages_2026_03_12         | inserted_at                  | timestamp without time zone | NO          | now()                                           |
| realtime            | messages_2026_03_12         | id                           | uuid                        | NO          | gen_random_uuid()                               |
| realtime            | messages_2026_03_13         | topic                        | text                        | NO          | null                                            |
| realtime            | messages_2026_03_13         | extension                    | text                        | NO          | null                                            |
| realtime            | messages_2026_03_13         | payload                      | jsonb                       | YES         | null                                            |
| realtime            | messages_2026_03_13         | event                        | text                        | YES         | null                                            |
| realtime            | messages_2026_03_13         | private                      | boolean                     | YES         | false                                           |
| realtime            | messages_2026_03_13         | updated_at                   | timestamp without time zone | NO          | now()                                           |
| realtime            | messages_2026_03_13         | inserted_at                  | timestamp without time zone | NO          | now()                                           |
| realtime            | messages_2026_03_13         | id                           | uuid                        | NO          | gen_random_uuid()                               |
| realtime            | messages_2026_03_14         | topic                        | text                        | NO          | null                                            |
| realtime            | messages_2026_03_14         | extension                    | text                        | NO          | null                                            |
| realtime            | messages_2026_03_14         | payload                      | jsonb                       | YES         | null                                            |
| realtime            | messages_2026_03_14         | event                        | text                        | YES         | null                                            |
| realtime            | messages_2026_03_14         | private                      | boolean                     | YES         | false                                           |
| realtime            | messages_2026_03_14         | updated_at                   | timestamp without time zone | NO          | now()                                           |
| realtime            | messages_2026_03_14         | inserted_at                  | timestamp without time zone | NO          | now()                                           |
| realtime            | messages_2026_03_14         | id                           | uuid                        | NO          | gen_random_uuid()                               |
| realtime            | messages_2026_03_15         | topic                        | text                        | NO          | null                                            |
| realtime            | messages_2026_03_15         | extension                    | text                        | NO          | null                                            |
| realtime            | messages_2026_03_15         | payload                      | jsonb                       | YES         | null                                            |
| realtime            | messages_2026_03_15         | event                        | text                        | YES         | null                                            |
| realtime            | messages_2026_03_15         | private                      | boolean                     | YES         | false                                           |
| realtime            | messages_2026_03_15         | updated_at                   | timestamp without time zone | NO          | now()                                           |
| realtime            | messages_2026_03_15         | inserted_at                  | timestamp without time zone | NO          | now()                                           |
| realtime            | messages_2026_03_15         | id                           | uuid                        | NO          | gen_random_uuid()                               |
| auth                | mfa_amr_claims              | session_id                   | uuid                        | NO          | null                                            |
| auth                | mfa_amr_claims              | created_at                   | timestamp with time zone    | NO          | null                                            |
| auth                | mfa_amr_claims              | updated_at                   | timestamp with time zone    | NO          | null                                            |
| auth                | mfa_amr_claims              | authentication_method        | text                        | NO          | null                                            |
| auth                | mfa_amr_claims              | id                           | uuid                        | NO          | null                                            |
| auth                | mfa_challenges              | id                           | uuid                        | NO          | null                                            |
| auth                | mfa_challenges              | factor_id                    | uuid                        | NO          | null                                            |
| auth                | mfa_challenges              | created_at                   | timestamp with time zone    | NO          | null                                            |
| auth                | mfa_challenges              | verified_at                  | timestamp with time zone    | YES         | null                                            |
| auth                | mfa_challenges              | ip_address                   | inet                        | NO          | null                                            |
| auth                | mfa_challenges              | otp_code                     | text                        | YES         | null                                            |
| auth                | mfa_challenges              | web_authn_session_data       | jsonb                       | YES         | null                                            |
| auth                | mfa_factors                 | id                           | uuid                        | NO          | null                                            |
| auth                | mfa_factors                 | user_id                      | uuid                        | NO          | null                                            |
| auth                | mfa_factors                 | friendly_name                | text                        | YES         | null                                            |
| auth                | mfa_factors                 | factor_type                  | USER-DEFINED                | NO          | null                                            |
| auth                | mfa_factors                 | status                       | USER-DEFINED                | NO          | null                                            |
| auth                | mfa_factors                 | created_at                   | timestamp with time zone    | NO          | null                                            |
| auth                | mfa_factors                 | updated_at                   | timestamp with time zone    | NO          | null                                            |
| auth                | mfa_factors                 | secret                       | text                        | YES         | null                                            |
| auth                | mfa_factors                 | phone                        | text                        | YES         | null                                            |
| auth                | mfa_factors                 | last_challenged_at           | timestamp with time zone    | YES         | null                                            |
| auth                | mfa_factors                 | web_authn_credential         | jsonb                       | YES         | null                                            |
| auth                | mfa_factors                 | web_authn_aaguid             | uuid                        | YES         | null                                            |
| auth                | mfa_factors                 | last_webauthn_challenge_data | jsonb                       | YES         | null                                            |
| storage             | migrations                  | id                           | integer                     | NO          | null                                            |
| storage             | migrations                  | name                         | character varying           | NO          | null                                            |
| storage             | migrations                  | hash                         | character varying           | NO          | null                                            |
| storage             | migrations                  | executed_at                  | timestamp without time zone | YES         | CURRENT_TIMESTAMP                               |
| auth                | oauth_authorizations        | id                           | uuid                        | NO          | null                                            |
| auth                | oauth_authorizations        | authorization_id             | text                        | NO          | null                                            |
| auth                | oauth_authorizations        | client_id                    | uuid                        | NO          | null                                            |
| auth                | oauth_authorizations        | user_id                      | uuid                        | YES         | null                                            |
| auth                | oauth_authorizations        | redirect_uri                 | text                        | NO          | null                                            |
| auth                | oauth_authorizations        | scope                        | text                        | NO          | null                                            |
| auth                | oauth_authorizations        | state                        | text                        | YES         | null                                            |
| auth                | oauth_authorizations        | resource                     | text                        | YES         | null                                            |
| auth                | oauth_authorizations        | code_challenge               | text                        | YES         | null                                            |
| auth                | oauth_authorizations        | code_challenge_method        | USER-DEFINED                | YES         | null                                            |
| auth                | oauth_authorizations        | response_type                | USER-DEFINED                | NO          | 'code'::auth.oauth_response_type                |
| auth                | oauth_authorizations        | status                       | USER-DEFINED                | NO          | 'pending'::auth.oauth_authorization_status      |
| auth                | oauth_authorizations        | authorization_code           | text                        | YES         | null                                            |
| auth                | oauth_authorizations        | created_at                   | timestamp with time zone    | NO          | now()                                           |
| auth                | oauth_authorizations        | expires_at                   | timestamp with time zone    | NO          | (now() + '00:03:00'::interval)                  |
| auth                | oauth_authorizations        | approved_at                  | timestamp with time zone    | YES         | null                                            |
| auth                | oauth_authorizations        | nonce                        | text                        | YES         | null                                            |
| auth                | oauth_client_states         | id                           | uuid                        | NO          | null                                            |
| auth                | oauth_client_states         | provider_type                | text                        | NO          | null                                            |
| auth                | oauth_client_states         | code_verifier                | text                        | YES         | null                                            |
| auth                | oauth_client_states         | created_at                   | timestamp with time zone    | NO          | null                                            |
| auth                | oauth_clients               | id                           | uuid                        | NO          | null                                            |
| auth                | oauth_clients               | client_secret_hash           | text                        | YES         | null                                            |
| auth                | oauth_clients               | registration_type            | USER-DEFINED                | NO          | null                                            |
| auth                | oauth_clients               | redirect_uris                | text                        | NO          | null                                            |
| auth                | oauth_clients               | grant_types                  | text                        | NO          | null                                            |
| auth                | oauth_clients               | client_name                  | text                        | YES         | null                                            |
| auth                | oauth_clients               | client_uri                   | text                        | YES         | null                                            |
| auth                | oauth_clients               | logo_uri                     | text                        | YES         | null                                            |
| auth                | oauth_clients               | created_at                   | timestamp with time zone    | NO          | now()                                           |
| auth                | oauth_clients               | updated_at                   | timestamp with time zone    | NO          | now()                                           |
| auth                | oauth_clients               | deleted_at                   | timestamp with time zone    | YES         | null                                            |
| auth                | oauth_clients               | client_type                  | USER-DEFINED                | NO          | 'confidential'::auth.oauth_client_type          |
| auth                | oauth_clients               | token_endpoint_auth_method   | text                        | NO          | null                                            |
| auth                | oauth_consents              | id                           | uuid                        | NO          | null                                            |
| auth                | oauth_consents              | user_id                      | uuid                        | NO          | null                                            |
| auth                | oauth_consents              | client_id                    | uuid                        | NO          | null                                            |
| auth                | oauth_consents              | scopes                       | text                        | NO          | null                                            |
| auth                | oauth_consents              | granted_at                   | timestamp with time zone    | NO          | now()                                           |
| auth                | oauth_consents              | revoked_at                   | timestamp with time zone    | YES         | null                                            |
| storage             | objects                     | id                           | uuid                        | NO          | gen_random_uuid()                               |
| storage             | objects                     | bucket_id                    | text                        | YES         | null                                            |
| storage             | objects                     | name                         | text                        | YES         | null                                            |
| storage             | objects                     | owner                        | uuid                        | YES         | null                                            |
| storage             | objects                     | created_at                   | timestamp with time zone    | YES         | now()                                           |
| storage             | objects                     | updated_at                   | timestamp with time zone    | YES         | now()                                           |
| storage             | objects                     | last_accessed_at             | timestamp with time zone    | YES         | now()                                           |
| storage             | objects                     | metadata                     | jsonb                       | YES         | null                                            |
| storage             | objects                     | path_tokens                  | ARRAY                       | YES         | null                                            |
| storage             | objects                     | version                      | text                        | YES         | null                                            |
| storage             | objects                     | owner_id                     | text                        | YES         | null                                            |
| storage             | objects                     | user_metadata                | jsonb                       | YES         | null                                            |
| auth                | one_time_tokens             | id                           | uuid                        | NO          | null                                            |
| auth                | one_time_tokens             | user_id                      | uuid                        | NO          | null                                            |
| auth                | one_time_tokens             | token_type                   | USER-DEFINED                | NO          | null                                            |
| auth                | one_time_tokens             | token_hash                   | text                        | NO          | null                                            |
| auth                | one_time_tokens             | relates_to                   | text                        | NO          | null                                            |
| auth                | one_time_tokens             | created_at                   | timestamp without time zone | NO          | now()                                           |
| auth                | one_time_tokens             | updated_at                   | timestamp without time zone | NO          | now()                                           |
| public              | participations              | id                           | uuid                        | NO          | gen_random_uuid()                               |
| public              | participations              | season_id                    | uuid                        | NO          | null                                            |
| public              | participations              | event_id                     | uuid                        | NO          | null                                            |
| public              | participations              | student_tr                   | text                        | YES         | null                                            |
| public              | participations              | team_id                      | uuid                        | YES         | null                                            |
| public              | participations              | house_id                     | uuid                        | NO          | null                                            |
| public              | participations              | hizb_id                      | uuid                        | YES         | null                                            |
| public              | participations              | status                       | USER-DEFINED                | YES         | 'registered'::participation_status              |
| public              | participations              | is_wildcard                  | boolean                     | YES         | false                                           |
| public              | participations              | registered_at                | timestamp with time zone    | YES         | now()                                           |
| extensions          | pg_stat_statements          | userid                       | oid                         | YES         | null                                            |
| extensions          | pg_stat_statements          | dbid                         | oid                         | YES         | null                                            |
| extensions          | pg_stat_statements          | toplevel                     | boolean                     | YES         | null                                            |
| extensions          | pg_stat_statements          | queryid                      | bigint                      | YES         | null                                            |
| extensions          | pg_stat_statements          | query                        | text                        | YES         | null                                            |
| extensions          | pg_stat_statements          | plans                        | bigint                      | YES         | null                                            |
| extensions          | pg_stat_statements          | total_plan_time              | double precision            | YES         | null                                            |
| extensions          | pg_stat_statements          | min_plan_time                | double precision            | YES         | null                                            |
| extensions          | pg_stat_statements          | max_plan_time                | double precision            | YES         | null                                            |
| extensions          | pg_stat_statements          | mean_plan_time               | double precision            | YES         | null                                            |
| extensions          | pg_stat_statements          | stddev_plan_time             | double precision            | YES         | null                                            |
| extensions          | pg_stat_statements          | calls                        | bigint                      | YES         | null                                            |
| extensions          | pg_stat_statements          | total_exec_time              | double precision            | YES         | null                                            |
| extensions          | pg_stat_statements          | min_exec_time                | double precision            | YES         | null                                            |
| extensions          | pg_stat_statements          | max_exec_time                | double precision            | YES         | null                                            |
| extensions          | pg_stat_statements          | mean_exec_time               | double precision            | YES         | null                                            |
| extensions          | pg_stat_statements          | stddev_exec_time             | double precision            | YES         | null                                            |
| extensions          | pg_stat_statements          | rows                         | bigint                      | YES         | null                                            |
| extensions          | pg_stat_statements          | shared_blks_hit              | bigint                      | YES         | null                                            |
| extensions          | pg_stat_statements          | shared_blks_read             | bigint                      | YES         | null                                            |
| extensions          | pg_stat_statements          | shared_blks_dirtied          | bigint                      | YES         | null                                            |
| extensions          | pg_stat_statements          | shared_blks_written          | bigint                      | YES         | null                                            |
| extensions          | pg_stat_statements          | local_blks_hit               | bigint                      | YES         | null                                            |
| extensions          | pg_stat_statements          | local_blks_read              | bigint                      | YES         | null                                            |
| extensions          | pg_stat_statements          | local_blks_dirtied           | bigint                      | YES         | null                                            |
| extensions          | pg_stat_statements          | local_blks_written           | bigint                      | YES         | null                                            |
| extensions          | pg_stat_statements          | temp_blks_read               | bigint                      | YES         | null                                            |
| extensions          | pg_stat_statements          | temp_blks_written            | bigint                      | YES         | null                                            |
| extensions          | pg_stat_statements          | shared_blk_read_time         | double precision            | YES         | null                                            |
| extensions          | pg_stat_statements          | shared_blk_write_time        | double precision            | YES         | null                                            |
| extensions          | pg_stat_statements          | local_blk_read_time          | double precision            | YES         | null                                            |
| extensions          | pg_stat_statements          | local_blk_write_time         | double precision            | YES         | null                                            |
| extensions          | pg_stat_statements          | temp_blk_read_time           | double precision            | YES         | null                                            |
| extensions          | pg_stat_statements          | temp_blk_write_time          | double precision            | YES         | null                                            |
| extensions          | pg_stat_statements          | wal_records                  | bigint                      | YES         | null                                            |
| extensions          | pg_stat_statements          | wal_fpi                      | bigint                      | YES         | null                                            |
| extensions          | pg_stat_statements          | wal_bytes                    | numeric                     | YES         | null                                            |
| extensions          | pg_stat_statements          | jit_functions                | bigint                      | YES         | null                                            |
| extensions          | pg_stat_statements          | jit_generation_time          | double precision            | YES         | null                                            |
| extensions          | pg_stat_statements          | jit_inlining_count           | bigint                      | YES         | null                                            |
| extensions          | pg_stat_statements          | jit_inlining_time            | double precision            | YES         | null                                            |
| extensions          | pg_stat_statements          | jit_optimization_count       | bigint                      | YES         | null                                            |
| extensions          | pg_stat_statements          | jit_optimization_time        | double precision            | YES         | null                                            |
| extensions          | pg_stat_statements          | jit_emission_count           | bigint                      | YES         | null                                            |
| extensions          | pg_stat_statements          | jit_emission_time            | double precision            | YES         | null                                            |
| extensions          | pg_stat_statements          | jit_deform_count             | bigint                      | YES         | null                                            |
| extensions          | pg_stat_statements          | jit_deform_time              | double precision            | YES         | null                                            |
| extensions          | pg_stat_statements          | stats_since                  | timestamp with time zone    | YES         | null                                            |
| extensions          | pg_stat_statements          | minmax_stats_since           | timestamp with time zone    | YES         | null                                            |
| extensions          | pg_stat_statements_info     | dealloc                      | bigint                      | YES         | null                                            |
| extensions          | pg_stat_statements_info     | stats_reset                  | timestamp with time zone    | YES         | null                                            |
| public              | point_transactions          | id                           | uuid                        | NO          | gen_random_uuid()                               |
| public              | point_transactions          | season_id                    | uuid                        | NO          | null                                            |
| public              | point_transactions          | house_id                     | uuid                        | NO          | null                                            |
| public              | point_transactions          | student_tr                   | text                        | YES         | null                                            |
| public              | point_transactions          | event_id                     | uuid                        | YES         | null                                            |
| public              | point_transactions          | source                       | USER-DEFINED                | NO          | null                                            |
| public              | point_transactions          | points                       | integer                     | NO          | null                                            |
| public              | point_transactions          | description                  | text                        | YES         | null                                            |
| public              | point_transactions          | created_at                   | timestamp with time zone    | YES         | now()                                           |
| public              | profiles                    | tr_number                    | text                        | NO          | null                                            |
| public              | profiles                    | user_id                      | uuid                        | YES         | null                                            |
| public              | profiles                    | edu_email                    | text                        | YES         | null                                            |
| public              | profiles                    | full_name                    | text                        | YES         | null                                            |
| public              | profiles                    | birth_date                   | date                        | YES         | null                                            |
| public              | profiles                    | age_category                 | text                        | YES         | null                                            |
| public              | profiles                    | house_id                     | uuid                        | YES         | null                                            |
| public              | profiles                    | hizb_id                      | uuid                        | YES         | null                                            |
| public              | profiles                    | avatar_url                   | text                        | YES         | null                                            |
| public              | profiles                    | created_at                   | timestamp with time zone    | YES         | now()                                           |
| public              | profiles                    | updated_at                   | timestamp with time zone    | YES         | now()                                           |
| public              | profiles                    | its_number                   | integer                     | YES         | null                                            |
| public              | profiles                    | darajah                      | smallint                    | YES         | null                                            |
| public              | profiles                    | class_name                   | text                        | YES         | null                                            |
| public              | profiles                    | is_under_18                  | boolean                     | YES         | null                                            |
| auth                | refresh_tokens              | instance_id                  | uuid                        | YES         | null                                            |
| auth                | refresh_tokens              | id                           | bigint                      | NO          | nextval('auth.refresh_tokens_id_seq'::regclass) |
| auth                | refresh_tokens              | token                        | character varying           | YES         | null                                            |
| auth                | refresh_tokens              | user_id                      | character varying           | YES         | null                                            |
| auth                | refresh_tokens              | revoked                      | boolean                     | YES         | null                                            |
| auth                | refresh_tokens              | created_at                   | timestamp with time zone    | YES         | null                                            |
| auth                | refresh_tokens              | updated_at                   | timestamp with time zone    | YES         | null                                            |
| auth                | refresh_tokens              | parent                       | character varying           | YES         | null                                            |
| auth                | refresh_tokens              | session_id                   | uuid                        | YES         | null                                            |
| storage             | s3_multipart_uploads        | id                           | text                        | NO          | null                                            |
| storage             | s3_multipart_uploads        | in_progress_size             | bigint                      | NO          | 0                                               |
| storage             | s3_multipart_uploads        | upload_signature             | text                        | NO          | null                                            |
| storage             | s3_multipart_uploads        | bucket_id                    | text                        | NO          | null                                            |
| storage             | s3_multipart_uploads        | key                          | text                        | NO          | null                                            |
| storage             | s3_multipart_uploads        | version                      | text                        | NO          | null                                            |
| storage             | s3_multipart_uploads        | owner_id                     | text                        | YES         | null                                            |
| storage             | s3_multipart_uploads        | created_at                   | timestamp with time zone    | NO          | now()                                           |
| storage             | s3_multipart_uploads        | user_metadata                | jsonb                       | YES         | null                                            |
| storage             | s3_multipart_uploads_parts  | id                           | uuid                        | NO          | gen_random_uuid()                               |
| storage             | s3_multipart_uploads_parts  | upload_id                    | text                        | NO          | null                                            |
| storage             | s3_multipart_uploads_parts  | size                         | bigint                      | NO          | 0                                               |
| storage             | s3_multipart_uploads_parts  | part_number                  | integer                     | NO          | null                                            |
| storage             | s3_multipart_uploads_parts  | bucket_id                    | text                        | NO          | null                                            |
| storage             | s3_multipart_uploads_parts  | key                          | text                        | NO          | null                                            |
| storage             | s3_multipart_uploads_parts  | etag                         | text                        | NO          | null                                            |
| storage             | s3_multipart_uploads_parts  | owner_id                     | text                        | YES         | null                                            |
| storage             | s3_multipart_uploads_parts  | version                      | text                        | NO          | null                                            |
| storage             | s3_multipart_uploads_parts  | created_at                   | timestamp with time zone    | NO          | now()                                           |
| auth                | saml_providers              | id                           | uuid                        | NO          | null                                            |
| auth                | saml_providers              | sso_provider_id              | uuid                        | NO          | null                                            |
| auth                | saml_providers              | entity_id                    | text                        | NO          | null                                            |
| auth                | saml_providers              | metadata_xml                 | text                        | NO          | null                                            |
| auth                | saml_providers              | metadata_url                 | text                        | YES         | null                                            |
| auth                | saml_providers              | attribute_mapping            | jsonb                       | YES         | null                                            |
| auth                | saml_providers              | created_at                   | timestamp with time zone    | YES         | null                                            |
| auth                | saml_providers              | updated_at                   | timestamp with time zone    | YES         | null                                            |
| auth                | saml_providers              | name_id_format               | text                        | YES         | null                                            |
| auth                | saml_relay_states           | id                           | uuid                        | NO          | null                                            |
| auth                | saml_relay_states           | sso_provider_id              | uuid                        | NO          | null                                            |
| auth                | saml_relay_states           | request_id                   | text                        | NO          | null                                            |
| auth                | saml_relay_states           | for_email                    | text                        | YES         | null                                            |
| auth                | saml_relay_states           | redirect_to                  | text                        | YES         | null                                            |
| auth                | saml_relay_states           | created_at                   | timestamp with time zone    | YES         | null                                            |
| auth                | saml_relay_states           | updated_at                   | timestamp with time zone    | YES         | null                                            |
| auth                | saml_relay_states           | flow_state_id                | uuid                        | YES         | null                                            |
| auth                | schema_migrations           | version                      | character varying           | NO          | null                                            |
| supabase_migrations | schema_migrations           | version                      | text                        | NO          | null                                            |
| realtime            | schema_migrations           | version                      | bigint                      | NO          | null                                            |
| realtime            | schema_migrations           | inserted_at                  | timestamp without time zone | YES         | null                                            |
| supabase_migrations | schema_migrations           | statements                   | ARRAY                       | YES         | null                                            |
| supabase_migrations | schema_migrations           | name                         | text                        | YES         | null                                            |
| public              | seasons                     | id                           | uuid                        | NO          | gen_random_uuid()                               |
| public              | seasons                     | name                         | text                        | NO          | null                                            |
| public              | seasons                     | start_date                   | date                        | YES         | null                                            |
| public              | seasons                     | end_date                     | date                        | YES         | null                                            |
| public              | seasons                     | is_active                    | boolean                     | YES         | false                                           |
| public              | seasons                     | created_at                   | timestamp with time zone    | YES         | now()                                           |
| vault               | secrets                     | id                           | uuid                        | NO          | gen_random_uuid()                               |
| vault               | secrets                     | name                         | text                        | YES         | null                                            |
| vault               | secrets                     | description                  | text                        | NO          | ''::text                                        |
| vault               | secrets                     | secret                       | text                        | NO          | null                                            |
| vault               | secrets                     | key_id                       | uuid                        | YES         | null                                            |
| vault               | secrets                     | nonce                        | bytea                       | YES         | vault._crypto_aead_det_noncegen()               |
| vault               | secrets                     | created_at                   | timestamp with time zone    | NO          | CURRENT_TIMESTAMP                               |
| vault               | secrets                     | updated_at                   | timestamp with time zone    | NO          | CURRENT_TIMESTAMP                               |
| auth                | sessions                    | id                           | uuid                        | NO          | null                                            |
| auth                | sessions                    | user_id                      | uuid                        | NO          | null                                            |
| auth                | sessions                    | created_at                   | timestamp with time zone    | YES         | null                                            |
| auth                | sessions                    | updated_at                   | timestamp with time zone    | YES         | null                                            |
| auth                | sessions                    | factor_id                    | uuid                        | YES         | null                                            |
| auth                | sessions                    | aal                          | USER-DEFINED                | YES         | null                                            |
| auth                | sessions                    | not_after                    | timestamp with time zone    | YES         | null                                            |
| auth                | sessions                    | refreshed_at                 | timestamp without time zone | YES         | null                                            |
| auth                | sessions                    | user_agent                   | text                        | YES         | null                                            |
| auth                | sessions                    | ip                           | inet                        | YES         | null                                            |
| auth                | sessions                    | tag                          | text                        | YES         | null                                            |
| auth                | sessions                    | oauth_client_id              | uuid                        | YES         | null                                            |
| auth                | sessions                    | refresh_token_hmac_key       | text                        | YES         | null                                            |
| auth                | sessions                    | refresh_token_counter        | bigint                      | YES         | null                                            |
| auth                | sessions                    | scopes                       | text                        | YES         | null                                            |
| public              | sport_self_assessments      | id                           | uuid                        | NO          | gen_random_uuid()                               |
| public              | sport_self_assessments      | student_id                   | uuid                        | NO          | null                                            |
| public              | sport_self_assessments      | sport_id                     | uuid                        | NO          | null                                            |
| public              | sport_self_assessments      | experience_level             | text                        | NO          | null                                            |
| public              | sport_self_assessments      | skill_rating                 | integer                     | NO          | null                                            |
| public              | sport_self_assessments      | years_of_practice            | integer                     | NO          | 0                                               |
| public              | sport_self_assessments      | created_at                   | timestamp with time zone    | NO          | now()                                           |
| public              | sports                      | id                           | uuid                        | NO          | gen_random_uuid()                               |
| public              | sports                      | name                         | text                        | NO          | null                                            |
| public              | sports                      | sport_type                   | USER-DEFINED                | NO          | 'individual'::sport_type                        |
| public              | sports                      | created_at                   | timestamp with time zone    | YES         | now()                                           |
| public              | sports                      | category                     | text                        | YES         | null                                            |
| public              | sports_interests            | id                           | uuid                        | NO          | gen_random_uuid()                               |
| public              | sports_interests            | student_id                   | uuid                        | NO          | null                                            |
| public              | sports_interests            | sport_id                     | uuid                        | NO          | null                                            |
| public              | sports_interests            | interest_level               | USER-DEFINED                | NO          | 'curious'::interest_level                       |
| public              | sports_interests            | confidence_level             | USER-DEFINED                | NO          | 'low'::confidence_level                         |
| public              | sports_interests            | created_by                   | USER-DEFINED                | NO          | 'student'::interest_created_by                  |
| public              | sports_interests            | notes                        | text                        | YES         | null                                            |
| public              | sports_interests            | created_at                   | timestamp with time zone    | NO          | now()                                           |
| public              | sports_interests            | updated_at                   | timestamp with time zone    | NO          | now()                                           |
| public              | sports_interests            | is_identified_talent         | boolean                     | NO          | false                                           |
| auth                | sso_domains                 | id                           | uuid                        | NO          | null                                            |
| auth                | sso_domains                 | sso_provider_id              | uuid                        | NO          | null                                            |
| auth                | sso_domains                 | domain                       | text                        | NO          | null                                            |
| auth                | sso_domains                 | created_at                   | timestamp with time zone    | YES         | null                                            |
| auth                | sso_domains                 | updated_at                   | timestamp with time zone    | YES         | null                                            |
| auth                | sso_providers               | id                           | uuid                        | NO          | null                                            |
| auth                | sso_providers               | resource_id                  | text                        | YES         | null                                            |
| auth                | sso_providers               | created_at                   | timestamp with time zone    | YES         | null                                            |
| auth                | sso_providers               | updated_at                   | timestamp with time zone    | YES         | null                                            |
| auth                | sso_providers               | disabled                     | boolean                     | YES         | null                                            |
| public              | student_event_roles         | id                           | uuid                        | NO          | gen_random_uuid()                               |
| public              | student_event_roles         | student_tr                   | text                        | NO          | null                                            |
| public              | student_event_roles         | event_id                     | uuid                        | NO          | null                                            |
| public              | student_event_roles         | season_id                    | uuid                        | NO          | null                                            |
| public              | student_event_roles         | role                         | USER-DEFINED                | NO          | null                                            |
| public              | student_rankings_view       | season_id                    | uuid                        | YES         | null                                            |
| public              | student_rankings_view       | student_tr                   | text                        | YES         | null                                            |
| public              | student_rankings_view       | student_name                 | text                        | YES         | null                                            |
| public              | student_rankings_view       | house_id                     | uuid                        | YES         | null                                            |
| public              | student_rankings_view       | house_name                   | text                        | YES         | null                                            |
| public              | student_rankings_view       | user_id                      | uuid                        | YES         | null                                            |
| public              | student_rankings_view       | total_points                 | integer                     | YES         | null                                            |
| public              | student_rankings_view       | placements                   | integer                     | YES         | null                                            |
| public              | student_rankings_view       | participations               | integer                     | YES         | null                                            |
| public              | student_selections          | id                           | uuid                        | NO          | gen_random_uuid()                               |
| public              | student_selections          | season_id                    | uuid                        | NO          | null                                            |
| public              | student_selections          | house_id                     | uuid                        | NO          | null                                            |
| public              | student_selections          | sport_id                     | uuid                        | NO          | null                                            |
| public              | student_selections          | category                     | text                        | NO          | null                                            |
| public              | student_selections          | rank                         | integer                     | NO          | null                                            |
| public              | student_selections          | student_id                   | uuid                        | NO          | null                                            |
| public              | student_selections          | eligibility                  | text                        | YES         | 'Eligible'::text                                |
| public              | student_selections          | created_by                   | uuid                        | YES         | null                                            |
| public              | student_selections          | created_at                   | timestamp with time zone    | YES         | now()                                           |
| public              | student_selections          | is_final                     | boolean                     | NO          | false                                           |
| public              | student_selections          | is_locked                    | boolean                     | NO          | false                                           |
| public              | student_sport_proficiencies | id                           | uuid                        | NO          | gen_random_uuid()                               |
| public              | student_sport_proficiencies | student_id                   | uuid                        | NO          | null                                            |
| public              | student_sport_proficiencies | sport_id                     | uuid                        | NO          | null                                            |
| public              | student_sport_proficiencies | level                        | USER-DEFINED                | NO          | 'beginner'::proficiency_level                   |
| public              | student_sport_proficiencies | source                       | text                        | NO          | 'self'::text                                    |
| public              | student_sport_proficiencies | updated_at                   | timestamp with time zone    | NO          | now()                                           |
| public              | student_sport_proficiencies | created_at                   | timestamp with time zone    | NO          | now()                                           |
| public              | student_sport_scores        | id                           | uuid                        | NO          | gen_random_uuid()                               |
| public              | student_sport_scores        | student_id                   | uuid                        | NO          | null                                            |
| public              | student_sport_scores        | sport_id                     | uuid                        | NO          | null                                            |
| public              | student_sport_scores        | competition_score            | integer                     | NO          | 0                                               |
| public              | student_sport_scores        | club_score                   | integer                     | NO          | 0                                               |
| public              | student_sport_scores        | activity_score               | integer                     | NO          | 0                                               |
| public              | student_sport_scores        | fitness_score                | integer                     | NO          | 0                                               |
| public              | student_sport_scores        | total_score                  | integer                     | NO          | 0                                               |
| public              | student_sport_scores        | proficiency_level            | USER-DEFINED                | NO          | 'beginner'::proficiency_level                   |
| public              | student_sport_scores        | last_calculated              | timestamp with time zone    | NO          | now()                                           |
| realtime            | subscription                | id                           | bigint                      | NO          | null                                            |
| realtime            | subscription                | subscription_id              | uuid                        | NO          | null                                            |
| realtime            | subscription                | entity                       | regclass                    | NO          | null                                            |
| realtime            | subscription                | filters                      | ARRAY                       | NO          | '{}'::realtime.user_defined_filter[]            |
| realtime            | subscription                | claims                       | jsonb                       | NO          | null                                            |
| realtime            | subscription                | claims_role                  | regrole                     | NO          | null                                            |
| realtime            | subscription                | created_at                   | timestamp without time zone | NO          | timezone('utc'::text, now())                    |
| realtime            | subscription                | action_filter                | text                        | YES         | '*'::text                                       |
| public              | team_members                | id                           | uuid                        | NO          | gen_random_uuid()                               |
| public              | team_members                | team_id                      | uuid                        | NO          | null                                            |
| public              | team_members                | student_tr                   | text                        | NO          | null                                            |
| public              | team_members                | role                         | USER-DEFINED                | YES         | 'player'::event_role                            |
| public              | team_standings              | id                           | uuid                        | NO          | gen_random_uuid()                               |
| public              | team_standings              | season_id                    | uuid                        | NO          | null                                            |
| public              | team_standings              | event_id                     | uuid                        | NO          | null                                            |
| public              | team_standings              | team_id                      | uuid                        | NO          | null                                            |
| public              | team_standings              | played                       | integer                     | YES         | 0                                               |
| public              | team_standings              | won                          | integer                     | YES         | 0                                               |
| public              | team_standings              | lost                         | integer                     | YES         | 0                                               |
| public              | team_standings              | drawn                        | integer                     | YES         | 0                                               |
| public              | team_standings              | goal_diff                    | numeric                     | YES         | 0                                               |
| public              | team_standings              | net_run_rate                 | numeric                     | YES         | 0                                               |
| public              | team_standings              | points                       | integer                     | YES         | 0                                               |
| public              | team_standings              | goals_for                    | numeric                     | YES         | 0                                               |
| public              | team_standings              | goals_against                | numeric                     | YES         | 0                                               |
| public              | teams                       | id                           | uuid                        | NO          | gen_random_uuid()                               |
| public              | teams                       | name                         | text                        | YES         | null                                            |
| public              | teams                       | house_id                     | uuid                        | YES         | null                                            |
| public              | teams                       | event_id                     | uuid                        | YES         | null                                            |
| public              | teams                       | age_group                    | text                        | YES         | null                                            |
| public              | teams                       | created_at                   | timestamp with time zone    | YES         | now()                                           |
| public              | temp_student_houses         | tr_number                    | text                        | YES         | null                                            |
| public              | temp_student_houses         | hizb_id                      | uuid                        | YES         | null                                            |
| public              | temp_student_houses         | house_id                     | uuid                        | YES         | null                                            |
| public              | training_attendance         | id                           | uuid                        | NO          | gen_random_uuid()                               |
| public              | training_attendance         | training_id                  | uuid                        | NO          | null                                            |
| public              | training_attendance         | student_tr                   | text                        | NO          | null                                            |
| public              | training_attendance         | attended_at                  | timestamp with time zone    | YES         | now()                                           |
| public              | trainings                   | id                           | uuid                        | NO          | gen_random_uuid()                               |
| public              | trainings                   | name                         | text                        | NO          | null                                            |
| public              | trainings                   | event_id                     | uuid                        | YES         | null                                            |
| public              | trainings                   | season_id                    | uuid                        | YES         | null                                            |
| public              | trainings                   | created_at                   | timestamp with time zone    | YES         | now()                                           |
| public              | user_roles                  | id                           | uuid                        | NO          | gen_random_uuid()                               |
| public              | user_roles                  | user_id                      | uuid                        | NO          | null                                            |
| public              | user_roles                  | role                         | USER-DEFINED                | NO          | null                                            |
| auth                | users                       | instance_id                  | uuid                        | YES         | null                                            |
| auth                | users                       | id                           | uuid                        | NO          | null                                            |
| auth                | users                       | aud                          | character varying           | YES         | null                                            |
| auth                | users                       | role                         | character varying           | YES         | null                                            |
| auth                | users                       | email                        | character varying           | YES         | null                                            |
| auth                | users                       | encrypted_password           | character varying           | YES         | null                                            |
| auth                | users                       | email_confirmed_at           | timestamp with time zone    | YES         | null                                            |
| auth                | users                       | invited_at                   | timestamp with time zone    | YES         | null                                            |
| auth                | users                       | confirmation_token           | character varying           | YES         | null                                            |
| auth                | users                       | confirmation_sent_at         | timestamp with time zone    | YES         | null                                            |
| auth                | users                       | recovery_token               | character varying           | YES         | null                                            |
| auth                | users                       | recovery_sent_at             | timestamp with time zone    | YES         | null                                            |
| auth                | users                       | email_change_token_new       | character varying           | YES         | null                                            |
| auth                | users                       | email_change                 | character varying           | YES         | null                                            |
| auth                | users                       | email_change_sent_at         | timestamp with time zone    | YES         | null                                            |
| auth                | users                       | last_sign_in_at              | timestamp with time zone    | YES         | null                                            |
| auth                | users                       | raw_app_meta_data            | jsonb                       | YES         | null                                            |
| auth                | users                       | raw_user_meta_data           | jsonb                       | YES         | null                                            |
| auth                | users                       | is_super_admin               | boolean                     | YES         | null                                            |
| auth                | users                       | created_at                   | timestamp with time zone    | YES         | null                                            |
| auth                | users                       | updated_at                   | timestamp with time zone    | YES         | null                                            |
| auth                | users                       | phone                        | text                        | YES         | NULL::character varying                         |
| auth                | users                       | phone_confirmed_at           | timestamp with time zone    | YES         | null                                            |
| auth                | users                       | phone_change                 | text                        | YES         | ''::character varying                           |
| auth                | users                       | phone_change_token           | character varying           | YES         | ''::character varying                           |
| auth                | users                       | phone_change_sent_at         | timestamp with time zone    | YES         | null                                            |
| auth                | users                       | confirmed_at                 | timestamp with time zone    | YES         | null                                            |
| auth                | users                       | email_change_token_current   | character varying           | YES         | ''::character varying                           |
| auth                | users                       | email_change_confirm_status  | smallint                    | YES         | 0                                               |
| auth                | users                       | banned_until                 | timestamp with time zone    | YES         | null                                            |
| auth                | users                       | reauthentication_token       | character varying           | YES         | ''::character varying                           |
| auth                | users                       | reauthentication_sent_at     | timestamp with time zone    | YES         | null                                            |
| auth                | users                       | is_sso_user                  | boolean                     | NO          | false                                           |
| auth                | users                       | deleted_at                   | timestamp with time zone    | YES         | null                                            |
| auth                | users                       | is_anonymous                 | boolean                     | NO          | false                                           |
| storage             | vector_indexes              | id                           | text                        | NO          | gen_random_uuid()                               |
| storage             | vector_indexes              | name                         | text                        | NO          | null                                            |
| storage             | vector_indexes              | bucket_id                    | text                        | NO          | null                                            |
| storage             | vector_indexes              | data_type                    | text                        | NO          | null                                            |
| storage             | vector_indexes              | dimension                    | integer                     | NO          | null                                            |
| storage             | vector_indexes              | distance_metric              | text                        | NO          | null                                            |
| storage             | vector_indexes              | metadata_configuration       | jsonb                       | YES         | null                                            |
| storage             | vector_indexes              | created_at                   | timestamp with time zone    | NO          | now()                                           |
| storage             | vector_indexes              | updated_at                   | timestamp with time zone    | NO          | now()                                           |
| public              | wildcard_programs           | id                           | uuid                        | NO          | gen_random_uuid()                               |
| public              | wildcard_programs           | event_id                     | uuid                        | NO          | null                                            |
| public              | wildcard_programs           | program_name                 | text                        | YES         | null                                            |
| public              | wildcard_programs           | quota_per_house              | integer                     | YES         | 0                                               |
| public              | wildcard_programs           | created_at                   | timestamp with time zone    | YES         | now()                                           |

# Primary Keys 

| table_schema        | table_name                  | column_name |
| ------------------- | --------------------------- | ----------- |
| public              | fitness_logs                | id          |
| public              | profiles                    | tr_number   |
| public              | team_members                | id          |
| public              | seasons                     | id          |
| public              | houses                      | id          |
| public              | hizb                        | id          |
| public              | user_roles                  | id          |
| public              | sports                      | id          |
| public              | events                      | id          |
| public              | wildcard_programs           | id          |
| public              | teams                       | id          |
| public              | matches                     | id          |
| public              | team_standings              | id          |
| public              | trainings                   | id          |
| public              | student_sport_proficiencies | id          |
| public              | sport_self_assessments      | id          |
| public              | student_selections          | id          |
| public              | sports_interests            | id          |
| public              | clubs                       | id          |
| public              | club_members                | id          |
| public              | club_events                 | id          |
| public              | club_event_participants     | id          |
| public              | match_requests              | id          |
| public              | match_request_players       | id          |
| public              | student_sport_scores        | id          |
| public              | certifications              | id          |
| public              | participations              | id          |
| public              | student_event_roles         | id          |
| public              | point_transactions          | id          |
| public              | training_attendance         | id          |
| public              | achievements                | id          |
| auth                | saml_relay_states           | id          |
| auth                | users                       | id          |
| auth                | oauth_client_states         | id          |
| auth                | custom_oauth_providers      | id          |
| auth                | oauth_consents              | id          |
| auth                | oauth_authorizations        | id          |
| auth                | oauth_clients               | id          |
| auth                | one_time_tokens             | id          |
| auth                | identities                  | id          |
| auth                | refresh_tokens              | id          |
| auth                | instances                   | id          |
| auth                | audit_log_entries           | id          |
| auth                | flow_state                  | id          |
| auth                | sessions                    | id          |
| auth                | mfa_factors                 | id          |
| auth                | mfa_challenges              | id          |
| auth                | mfa_amr_claims              | id          |
| auth                | sso_providers               | id          |
| auth                | sso_domains                 | id          |
| auth                | saml_providers              | id          |
| storage             | buckets_analytics           | id          |
| storage             | buckets                     | id          |
| storage             | objects                     | id          |
| storage             | s3_multipart_uploads        | id          |
| storage             | s3_multipart_uploads_parts  | id          |
| realtime            | messages_2026_03_10         | id          |
| realtime            | messages_2026_03_10         | inserted_at |
| realtime            | subscription                | id          |
| realtime            | messages                    | id          |
| realtime            | messages                    | inserted_at |
| realtime            | messages_2026_03_11         | id          |
| realtime            | messages_2026_03_11         | inserted_at |
| realtime            | schema_migrations           | version     |
| realtime            | schema_migrations           | version     |
| realtime            | schema_migrations           | version     |
| realtime            | messages_2026_03_14         | id          |
| realtime            | messages_2026_03_14         | inserted_at |
| realtime            | messages_2026_03_13         | id          |
| realtime            | messages_2026_03_13         | inserted_at |
| realtime            | messages_2026_03_12         | id          |
| realtime            | messages_2026_03_12         | inserted_at |
| vault               | secrets                     | id          |
| supabase_migrations | schema_migrations           | version     |
| supabase_migrations | schema_migrations           | version     |
| supabase_migrations | schema_migrations           | version     |


# Foreign Keys 
| table_schema | table_name                  | column_name    | foreign_table  | foreign_column |
| ------------ | --------------------------- | -------------- | -------------- | -------------- |
| public       | fitness_logs                | student_tr     | profiles       | tr_number      |
| public       | match_request_players       | request_id     | match_requests | id             |
| public       | student_sport_scores        | sport_id       | sports         | id             |
| public       | certifications              | sport_id       | sports         | id             |
| public       | team_members                | team_id        | teams          | id             |
| public       | team_members                | student_tr     | profiles       | tr_number      |
| public       | participations              | season_id      | seasons        | id             |
| public       | participations              | event_id       | events         | id             |
| public       | participations              | student_tr     | profiles       | tr_number      |
| public       | participations              | team_id        | teams          | id             |
| public       | participations              | house_id       | houses         | id             |
| public       | participations              | hizb_id        | hizb           | id             |
| public       | student_event_roles         | student_tr     | profiles       | tr_number      |
| public       | student_event_roles         | event_id       | events         | id             |
| public       | student_event_roles         | season_id      | seasons        | id             |
| public       | point_transactions          | season_id      | seasons        | id             |
| public       | point_transactions          | house_id       | houses         | id             |
| public       | point_transactions          | student_tr     | profiles       | tr_number      |
| public       | point_transactions          | event_id       | events         | id             |
| public       | training_attendance         | training_id    | trainings      | id             |
| public       | training_attendance         | student_tr     | profiles       | tr_number      |
| public       | achievements                | student_tr     | profiles       | tr_number      |
| public       | profiles                    | house_id       | houses         | id             |
| public       | profiles                    | hizb_id        | hizb           | id             |
| public       | hizb                        | house_id       | houses         | id             |
| public       | events                      | sport_id       | sports         | id             |
| public       | events                      | season_id      | seasons        | id             |
| public       | wildcard_programs           | event_id       | events         | id             |
| public       | teams                       | house_id       | houses         | id             |
| public       | teams                       | event_id       | events         | id             |
| public       | matches                     | season_id      | seasons        | id             |
| public       | matches                     | event_id       | events         | id             |
| public       | matches                     | home_team_id   | teams          | id             |
| public       | matches                     | away_team_id   | teams          | id             |
| public       | matches                     | winner_team_id | teams          | id             |
| public       | team_standings              | season_id      | seasons        | id             |
| public       | team_standings              | event_id       | events         | id             |
| public       | team_standings              | team_id        | teams          | id             |
| public       | trainings                   | event_id       | events         | id             |
| public       | trainings                   | season_id      | seasons        | id             |
| public       | student_sport_proficiencies | sport_id       | sports         | id             |
| public       | sport_self_assessments      | sport_id       | sports         | id             |
| public       | student_selections          | season_id      | seasons        | id             |
| public       | student_selections          | house_id       | houses         | id             |
| public       | student_selections          | sport_id       | sports         | id             |
| public       | sports_interests            | sport_id       | sports         | id             |
| public       | clubs                       | sport_id       | sports         | id             |
| public       | club_members                | club_id        | clubs          | id             |
| public       | club_events                 | club_id        | clubs          | id             |
| public       | club_event_participants     | club_event_id  | club_events    | id             |
| public       | match_requests              | sport_id       | sports         | id             |

# indexes

| schemaname          | tablename                   | indexname                                                     | indexdef                                                                                                                                                                                   |
| ------------------- | --------------------------- | ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| auth                | users                       | users_pkey                                                    | CREATE UNIQUE INDEX users_pkey ON auth.users USING btree (id)                                                                                                                              |
| auth                | users                       | users_instance_id_idx                                         | CREATE INDEX users_instance_id_idx ON auth.users USING btree (instance_id)                                                                                                                 |
| auth                | refresh_tokens              | refresh_tokens_pkey                                           | CREATE UNIQUE INDEX refresh_tokens_pkey ON auth.refresh_tokens USING btree (id)                                                                                                            |
| auth                | refresh_tokens              | refresh_tokens_instance_id_idx                                | CREATE INDEX refresh_tokens_instance_id_idx ON auth.refresh_tokens USING btree (instance_id)                                                                                               |
| auth                | refresh_tokens              | refresh_tokens_instance_id_user_id_idx                        | CREATE INDEX refresh_tokens_instance_id_user_id_idx ON auth.refresh_tokens USING btree (instance_id, user_id)                                                                              |
| auth                | instances                   | instances_pkey                                                | CREATE UNIQUE INDEX instances_pkey ON auth.instances USING btree (id)                                                                                                                      |
| auth                | audit_log_entries           | audit_log_entries_pkey                                        | CREATE UNIQUE INDEX audit_log_entries_pkey ON auth.audit_log_entries USING btree (id)                                                                                                      |
| auth                | audit_log_entries           | audit_logs_instance_id_idx                                    | CREATE INDEX audit_logs_instance_id_idx ON auth.audit_log_entries USING btree (instance_id)                                                                                                |
| auth                | schema_migrations           | schema_migrations_pkey                                        | CREATE UNIQUE INDEX schema_migrations_pkey ON auth.schema_migrations USING btree (version)                                                                                                 |
| vault               | secrets                     | secrets_pkey                                                  | CREATE UNIQUE INDEX secrets_pkey ON vault.secrets USING btree (id)                                                                                                                         |
| vault               | secrets                     | secrets_name_idx                                              | CREATE UNIQUE INDEX secrets_name_idx ON vault.secrets USING btree (name) WHERE (name IS NOT NULL)                                                                                          |
| auth                | refresh_tokens              | refresh_tokens_token_unique                                   | CREATE UNIQUE INDEX refresh_tokens_token_unique ON auth.refresh_tokens USING btree (token)                                                                                                 |
| auth                | refresh_tokens              | refresh_tokens_parent_idx                                     | CREATE INDEX refresh_tokens_parent_idx ON auth.refresh_tokens USING btree (parent)                                                                                                         |
| auth                | identities                  | identities_user_id_idx                                        | CREATE INDEX identities_user_id_idx ON auth.identities USING btree (user_id)                                                                                                               |
| auth                | users                       | users_instance_id_email_idx                                   | CREATE INDEX users_instance_id_email_idx ON auth.users USING btree (instance_id, lower((email)::text))                                                                                     |
| auth                | users                       | confirmation_token_idx                                        | CREATE UNIQUE INDEX confirmation_token_idx ON auth.users USING btree (confirmation_token) WHERE ((confirmation_token)::text !~ '^[0-9 ]*$'::text)                                          |
| auth                | users                       | recovery_token_idx                                            | CREATE UNIQUE INDEX recovery_token_idx ON auth.users USING btree (recovery_token) WHERE ((recovery_token)::text !~ '^[0-9 ]*$'::text)                                                      |
| auth                | users                       | email_change_token_current_idx                                | CREATE UNIQUE INDEX email_change_token_current_idx ON auth.users USING btree (email_change_token_current) WHERE ((email_change_token_current)::text !~ '^[0-9 ]*$'::text)                  |
| auth                | users                       | email_change_token_new_idx                                    | CREATE UNIQUE INDEX email_change_token_new_idx ON auth.users USING btree (email_change_token_new) WHERE ((email_change_token_new)::text !~ '^[0-9 ]*$'::text)                              |
| auth                | users                       | reauthentication_token_idx                                    | CREATE UNIQUE INDEX reauthentication_token_idx ON auth.users USING btree (reauthentication_token) WHERE ((reauthentication_token)::text !~ '^[0-9 ]*$'::text)                              |
| auth                | sessions                    | sessions_pkey                                                 | CREATE UNIQUE INDEX sessions_pkey ON auth.sessions USING btree (id)                                                                                                                        |
| auth                | mfa_factors                 | mfa_factors_pkey                                              | CREATE UNIQUE INDEX mfa_factors_pkey ON auth.mfa_factors USING btree (id)                                                                                                                  |
| auth                | mfa_factors                 | mfa_factors_user_friendly_name_unique                         | CREATE UNIQUE INDEX mfa_factors_user_friendly_name_unique ON auth.mfa_factors USING btree (friendly_name, user_id) WHERE (TRIM(BOTH FROM friendly_name) <> ''::text)                       |
| auth                | mfa_challenges              | mfa_challenges_pkey                                           | CREATE UNIQUE INDEX mfa_challenges_pkey ON auth.mfa_challenges USING btree (id)                                                                                                            |
| auth                | mfa_amr_claims              | mfa_amr_claims_session_id_authentication_method_pkey          | CREATE UNIQUE INDEX mfa_amr_claims_session_id_authentication_method_pkey ON auth.mfa_amr_claims USING btree (session_id, authentication_method)                                            |
| auth                | mfa_amr_claims              | amr_id_pk                                                     | CREATE UNIQUE INDEX amr_id_pk ON auth.mfa_amr_claims USING btree (id)                                                                                                                      |
| auth                | sessions                    | user_id_created_at_idx                                        | CREATE INDEX user_id_created_at_idx ON auth.sessions USING btree (user_id, created_at)                                                                                                     |
| auth                | mfa_factors                 | factor_id_created_at_idx                                      | CREATE INDEX factor_id_created_at_idx ON auth.mfa_factors USING btree (user_id, created_at)                                                                                                |
| auth                | sessions                    | sessions_user_id_idx                                          | CREATE INDEX sessions_user_id_idx ON auth.sessions USING btree (user_id)                                                                                                                   |
| auth                | refresh_tokens              | refresh_tokens_session_id_revoked_idx                         | CREATE INDEX refresh_tokens_session_id_revoked_idx ON auth.refresh_tokens USING btree (session_id, revoked)                                                                                |
| auth                | sso_providers               | sso_providers_pkey                                            | CREATE UNIQUE INDEX sso_providers_pkey ON auth.sso_providers USING btree (id)                                                                                                              |
| auth                | sso_providers               | sso_providers_resource_id_idx                                 | CREATE UNIQUE INDEX sso_providers_resource_id_idx ON auth.sso_providers USING btree (lower(resource_id))                                                                                   |
| auth                | sso_domains                 | sso_domains_pkey                                              | CREATE UNIQUE INDEX sso_domains_pkey ON auth.sso_domains USING btree (id)                                                                                                                  |
| auth                | sso_domains                 | sso_domains_sso_provider_id_idx                               | CREATE INDEX sso_domains_sso_provider_id_idx ON auth.sso_domains USING btree (sso_provider_id)                                                                                             |
| auth                | sso_domains                 | sso_domains_domain_idx                                        | CREATE UNIQUE INDEX sso_domains_domain_idx ON auth.sso_domains USING btree (lower(domain))                                                                                                 |
| auth                | saml_providers              | saml_providers_pkey                                           | CREATE UNIQUE INDEX saml_providers_pkey ON auth.saml_providers USING btree (id)                                                                                                            |
| auth                | saml_providers              | saml_providers_entity_id_key                                  | CREATE UNIQUE INDEX saml_providers_entity_id_key ON auth.saml_providers USING btree (entity_id)                                                                                            |
| auth                | saml_providers              | saml_providers_sso_provider_id_idx                            | CREATE INDEX saml_providers_sso_provider_id_idx ON auth.saml_providers USING btree (sso_provider_id)                                                                                       |
| auth                | saml_relay_states           | saml_relay_states_pkey                                        | CREATE UNIQUE INDEX saml_relay_states_pkey ON auth.saml_relay_states USING btree (id)                                                                                                      |
| auth                | saml_relay_states           | saml_relay_states_sso_provider_id_idx                         | CREATE INDEX saml_relay_states_sso_provider_id_idx ON auth.saml_relay_states USING btree (sso_provider_id)                                                                                 |
| auth                | saml_relay_states           | saml_relay_states_for_email_idx                               | CREATE INDEX saml_relay_states_for_email_idx ON auth.saml_relay_states USING btree (for_email)                                                                                             |
| auth                | users                       | users_email_partial_key                                       | CREATE UNIQUE INDEX users_email_partial_key ON auth.users USING btree (email) WHERE (is_sso_user = false)                                                                                  |
| auth                | identities                  | identities_email_idx                                          | CREATE INDEX identities_email_idx ON auth.identities USING btree (email text_pattern_ops)                                                                                                  |
| auth                | users                       | users_phone_key                                               | CREATE UNIQUE INDEX users_phone_key ON auth.users USING btree (phone)                                                                                                                      |
| auth                | flow_state                  | flow_state_pkey                                               | CREATE UNIQUE INDEX flow_state_pkey ON auth.flow_state USING btree (id)                                                                                                                    |
| auth                | flow_state                  | idx_auth_code                                                 | CREATE INDEX idx_auth_code ON auth.flow_state USING btree (auth_code)                                                                                                                      |
| auth                | flow_state                  | idx_user_id_auth_method                                       | CREATE INDEX idx_user_id_auth_method ON auth.flow_state USING btree (user_id, authentication_method)                                                                                       |
| auth                | refresh_tokens              | refresh_tokens_updated_at_idx                                 | CREATE INDEX refresh_tokens_updated_at_idx ON auth.refresh_tokens USING btree (updated_at DESC)                                                                                            |
| auth                | flow_state                  | flow_state_created_at_idx                                     | CREATE INDEX flow_state_created_at_idx ON auth.flow_state USING btree (created_at DESC)                                                                                                    |
| auth                | saml_relay_states           | saml_relay_states_created_at_idx                              | CREATE INDEX saml_relay_states_created_at_idx ON auth.saml_relay_states USING btree (created_at DESC)                                                                                      |
| auth                | sessions                    | sessions_not_after_idx                                        | CREATE INDEX sessions_not_after_idx ON auth.sessions USING btree (not_after DESC)                                                                                                          |
| auth                | mfa_challenges              | mfa_challenge_created_at_idx                                  | CREATE INDEX mfa_challenge_created_at_idx ON auth.mfa_challenges USING btree (created_at DESC)                                                                                             |
| auth                | mfa_factors                 | mfa_factors_user_id_idx                                       | CREATE INDEX mfa_factors_user_id_idx ON auth.mfa_factors USING btree (user_id)                                                                                                             |
| auth                | identities                  | identities_pkey                                               | CREATE UNIQUE INDEX identities_pkey ON auth.identities USING btree (id)                                                                                                                    |
| auth                | identities                  | identities_provider_id_provider_unique                        | CREATE UNIQUE INDEX identities_provider_id_provider_unique ON auth.identities USING btree (provider_id, provider)                                                                          |
| auth                | users                       | users_is_anonymous_idx                                        | CREATE INDEX users_is_anonymous_idx ON auth.users USING btree (is_anonymous)                                                                                                               |
| auth                | one_time_tokens             | one_time_tokens_pkey                                          | CREATE UNIQUE INDEX one_time_tokens_pkey ON auth.one_time_tokens USING btree (id)                                                                                                          |
| auth                | one_time_tokens             | one_time_tokens_token_hash_hash_idx                           | CREATE INDEX one_time_tokens_token_hash_hash_idx ON auth.one_time_tokens USING hash (token_hash)                                                                                           |
| auth                | one_time_tokens             | one_time_tokens_relates_to_hash_idx                           | CREATE INDEX one_time_tokens_relates_to_hash_idx ON auth.one_time_tokens USING hash (relates_to)                                                                                           |
| auth                | one_time_tokens             | one_time_tokens_user_id_token_type_key                        | CREATE UNIQUE INDEX one_time_tokens_user_id_token_type_key ON auth.one_time_tokens USING btree (user_id, token_type)                                                                       |
| auth                | mfa_factors                 | unique_phone_factor_per_user                                  | CREATE UNIQUE INDEX unique_phone_factor_per_user ON auth.mfa_factors USING btree (user_id, phone)                                                                                          |
| auth                | mfa_factors                 | mfa_factors_last_challenged_at_key                            | CREATE UNIQUE INDEX mfa_factors_last_challenged_at_key ON auth.mfa_factors USING btree (last_challenged_at)                                                                                |
| auth                | sso_providers               | sso_providers_resource_id_pattern_idx                         | CREATE INDEX sso_providers_resource_id_pattern_idx ON auth.sso_providers USING btree (resource_id text_pattern_ops)                                                                        |
| auth                | oauth_clients               | oauth_clients_pkey                                            | CREATE UNIQUE INDEX oauth_clients_pkey ON auth.oauth_clients USING btree (id)                                                                                                              |
| auth                | oauth_clients               | oauth_clients_deleted_at_idx                                  | CREATE INDEX oauth_clients_deleted_at_idx ON auth.oauth_clients USING btree (deleted_at)                                                                                                   |
| auth                | oauth_authorizations        | oauth_authorizations_pkey                                     | CREATE UNIQUE INDEX oauth_authorizations_pkey ON auth.oauth_authorizations USING btree (id)                                                                                                |
| auth                | oauth_authorizations        | oauth_authorizations_authorization_id_key                     | CREATE UNIQUE INDEX oauth_authorizations_authorization_id_key ON auth.oauth_authorizations USING btree (authorization_id)                                                                  |
| auth                | oauth_authorizations        | oauth_authorizations_authorization_code_key                   | CREATE UNIQUE INDEX oauth_authorizations_authorization_code_key ON auth.oauth_authorizations USING btree (authorization_code)                                                              |
| auth                | oauth_authorizations        | oauth_auth_pending_exp_idx                                    | CREATE INDEX oauth_auth_pending_exp_idx ON auth.oauth_authorizations USING btree (expires_at) WHERE (status = 'pending'::auth.oauth_authorization_status)                                  |
| auth                | oauth_consents              | oauth_consents_pkey                                           | CREATE UNIQUE INDEX oauth_consents_pkey ON auth.oauth_consents USING btree (id)                                                                                                            |
| auth                | oauth_consents              | oauth_consents_user_client_unique                             | CREATE UNIQUE INDEX oauth_consents_user_client_unique ON auth.oauth_consents USING btree (user_id, client_id)                                                                              |
| auth                | oauth_consents              | oauth_consents_active_user_client_idx                         | CREATE INDEX oauth_consents_active_user_client_idx ON auth.oauth_consents USING btree (user_id, client_id) WHERE (revoked_at IS NULL)                                                      |
| auth                | oauth_consents              | oauth_consents_user_order_idx                                 | CREATE INDEX oauth_consents_user_order_idx ON auth.oauth_consents USING btree (user_id, granted_at DESC)                                                                                   |
| auth                | oauth_consents              | oauth_consents_active_client_idx                              | CREATE INDEX oauth_consents_active_client_idx ON auth.oauth_consents USING btree (client_id) WHERE (revoked_at IS NULL)                                                                    |
| auth                | sessions                    | sessions_oauth_client_id_idx                                  | CREATE INDEX sessions_oauth_client_id_idx ON auth.sessions USING btree (oauth_client_id)                                                                                                   |
| auth                | oauth_client_states         | oauth_client_states_pkey                                      | CREATE UNIQUE INDEX oauth_client_states_pkey ON auth.oauth_client_states USING btree (id)                                                                                                  |
| auth                | oauth_client_states         | idx_oauth_client_states_created_at                            | CREATE INDEX idx_oauth_client_states_created_at ON auth.oauth_client_states USING btree (created_at)                                                                                       |
| realtime            | schema_migrations           | schema_migrations_pkey                                        | CREATE UNIQUE INDEX schema_migrations_pkey ON realtime.schema_migrations USING btree (version)                                                                                             |
| realtime            | subscription                | pk_subscription                                               | CREATE UNIQUE INDEX pk_subscription ON realtime.subscription USING btree (id)                                                                                                              |
| storage             | migrations                  | migrations_pkey                                               | CREATE UNIQUE INDEX migrations_pkey ON storage.migrations USING btree (id)                                                                                                                 |
| storage             | migrations                  | migrations_name_key                                           | CREATE UNIQUE INDEX migrations_name_key ON storage.migrations USING btree (name)                                                                                                           |
| storage             | buckets                     | buckets_pkey                                                  | CREATE UNIQUE INDEX buckets_pkey ON storage.buckets USING btree (id)                                                                                                                       |
| storage             | buckets                     | bname                                                         | CREATE UNIQUE INDEX bname ON storage.buckets USING btree (name)                                                                                                                            |
| storage             | objects                     | objects_pkey                                                  | CREATE UNIQUE INDEX objects_pkey ON storage.objects USING btree (id)                                                                                                                       |
| storage             | objects                     | bucketid_objname                                              | CREATE UNIQUE INDEX bucketid_objname ON storage.objects USING btree (bucket_id, name)                                                                                                      |
| storage             | objects                     | name_prefix_search                                            | CREATE INDEX name_prefix_search ON storage.objects USING btree (name text_pattern_ops)                                                                                                     |
| storage             | objects                     | idx_objects_bucket_id_name                                    | CREATE INDEX idx_objects_bucket_id_name ON storage.objects USING btree (bucket_id, name COLLATE "C")                                                                                       |
| storage             | s3_multipart_uploads        | s3_multipart_uploads_pkey                                     | CREATE UNIQUE INDEX s3_multipart_uploads_pkey ON storage.s3_multipart_uploads USING btree (id)                                                                                             |
| storage             | s3_multipart_uploads_parts  | s3_multipart_uploads_parts_pkey                               | CREATE UNIQUE INDEX s3_multipart_uploads_parts_pkey ON storage.s3_multipart_uploads_parts USING btree (id)                                                                                 |
| storage             | s3_multipart_uploads        | idx_multipart_uploads_list                                    | CREATE INDEX idx_multipart_uploads_list ON storage.s3_multipart_uploads USING btree (bucket_id, key, created_at)                                                                           |
| storage             | buckets_vectors             | buckets_vectors_pkey                                          | CREATE UNIQUE INDEX buckets_vectors_pkey ON storage.buckets_vectors USING btree (id)                                                                                                       |
| storage             | vector_indexes              | vector_indexes_pkey                                           | CREATE UNIQUE INDEX vector_indexes_pkey ON storage.vector_indexes USING btree (id)                                                                                                         |
| storage             | vector_indexes              | vector_indexes_name_bucket_id_idx                             | CREATE UNIQUE INDEX vector_indexes_name_bucket_id_idx ON storage.vector_indexes USING btree (name, bucket_id)                                                                              |
| storage             | buckets_analytics           | buckets_analytics_pkey                                        | CREATE UNIQUE INDEX buckets_analytics_pkey ON storage.buckets_analytics USING btree (id)                                                                                                   |
| storage             | buckets_analytics           | buckets_analytics_unique_name_idx                             | CREATE UNIQUE INDEX buckets_analytics_unique_name_idx ON storage.buckets_analytics USING btree (name) WHERE (deleted_at IS NULL)                                                           |
| realtime            | subscription                | ix_realtime_subscription_entity                               | CREATE INDEX ix_realtime_subscription_entity ON realtime.subscription USING btree (entity)                                                                                                 |
| storage             | objects                     | idx_objects_bucket_id_name_lower                              | CREATE INDEX idx_objects_bucket_id_name_lower ON storage.objects USING btree (bucket_id, lower(name) COLLATE "C")                                                                          |
| realtime            | messages                    | messages_pkey                                                 | CREATE UNIQUE INDEX messages_pkey ON ONLY realtime.messages USING btree (id, inserted_at)                                                                                                  |
| realtime            | messages                    | messages_inserted_at_topic_index                              | CREATE INDEX messages_inserted_at_topic_index ON ONLY realtime.messages USING btree (inserted_at DESC, topic) WHERE ((extension = 'broadcast'::text) AND (private IS TRUE))                |
| realtime            | subscription                | subscription_subscription_id_entity_filters_action_filter_key | CREATE UNIQUE INDEX subscription_subscription_id_entity_filters_action_filter_key ON realtime.subscription USING btree (subscription_id, entity, filters, action_filter)                   |
| auth                | custom_oauth_providers      | custom_oauth_providers_pkey                                   | CREATE UNIQUE INDEX custom_oauth_providers_pkey ON auth.custom_oauth_providers USING btree (id)                                                                                            |
| auth                | custom_oauth_providers      | custom_oauth_providers_identifier_key                         | CREATE UNIQUE INDEX custom_oauth_providers_identifier_key ON auth.custom_oauth_providers USING btree (identifier)                                                                          |
| auth                | custom_oauth_providers      | custom_oauth_providers_identifier_idx                         | CREATE INDEX custom_oauth_providers_identifier_idx ON auth.custom_oauth_providers USING btree (identifier)                                                                                 |
| auth                | custom_oauth_providers      | custom_oauth_providers_provider_type_idx                      | CREATE INDEX custom_oauth_providers_provider_type_idx ON auth.custom_oauth_providers USING btree (provider_type)                                                                           |
| auth                | custom_oauth_providers      | custom_oauth_providers_enabled_idx                            | CREATE INDEX custom_oauth_providers_enabled_idx ON auth.custom_oauth_providers USING btree (enabled)                                                                                       |
| auth                | custom_oauth_providers      | custom_oauth_providers_created_at_idx                         | CREATE INDEX custom_oauth_providers_created_at_idx ON auth.custom_oauth_providers USING btree (created_at)                                                                                 |
| supabase_migrations | schema_migrations           | schema_migrations_pkey                                        | CREATE UNIQUE INDEX schema_migrations_pkey ON supabase_migrations.schema_migrations USING btree (version)                                                                                  |
| public              | seasons                     | seasons_pkey                                                  | CREATE UNIQUE INDEX seasons_pkey ON public.seasons USING btree (id)                                                                                                                        |
| public              | houses                      | houses_pkey                                                   | CREATE UNIQUE INDEX houses_pkey ON public.houses USING btree (id)                                                                                                                          |
| public              | houses                      | houses_name_key                                               | CREATE UNIQUE INDEX houses_name_key ON public.houses USING btree (name)                                                                                                                    |
| public              | hizb                        | hizb_pkey                                                     | CREATE UNIQUE INDEX hizb_pkey ON public.hizb USING btree (id)                                                                                                                              |
| public              | user_roles                  | user_roles_pkey                                               | CREATE UNIQUE INDEX user_roles_pkey ON public.user_roles USING btree (id)                                                                                                                  |
| public              | user_roles                  | user_roles_user_id_role_key                                   | CREATE UNIQUE INDEX user_roles_user_id_role_key ON public.user_roles USING btree (user_id, role)                                                                                           |
| public              | sports                      | sports_pkey                                                   | CREATE UNIQUE INDEX sports_pkey ON public.sports USING btree (id)                                                                                                                          |
| public              | events                      | events_pkey                                                   | CREATE UNIQUE INDEX events_pkey ON public.events USING btree (id)                                                                                                                          |
| public              | wildcard_programs           | wildcard_programs_pkey                                        | CREATE UNIQUE INDEX wildcard_programs_pkey ON public.wildcard_programs USING btree (id)                                                                                                    |
| public              | teams                       | teams_pkey                                                    | CREATE UNIQUE INDEX teams_pkey ON public.teams USING btree (id)                                                                                                                            |
| public              | matches                     | matches_pkey                                                  | CREATE UNIQUE INDEX matches_pkey ON public.matches USING btree (id)                                                                                                                        |
| public              | team_standings              | team_standings_pkey                                           | CREATE UNIQUE INDEX team_standings_pkey ON public.team_standings USING btree (id)                                                                                                          |
| public              | trainings                   | trainings_pkey                                                | CREATE UNIQUE INDEX trainings_pkey ON public.trainings USING btree (id)                                                                                                                    |
| public              | student_sport_proficiencies | student_sport_proficiencies_pkey                              | CREATE UNIQUE INDEX student_sport_proficiencies_pkey ON public.student_sport_proficiencies USING btree (id)                                                                                |
| public              | student_sport_proficiencies | student_sport_proficiencies_student_id_sport_id_key           | CREATE UNIQUE INDEX student_sport_proficiencies_student_id_sport_id_key ON public.student_sport_proficiencies USING btree (student_id, sport_id)                                           |
| public              | sport_self_assessments      | sport_self_assessments_pkey                                   | CREATE UNIQUE INDEX sport_self_assessments_pkey ON public.sport_self_assessments USING btree (id)                                                                                          |
| public              | sport_self_assessments      | sport_self_assessments_student_id_sport_id_key                | CREATE UNIQUE INDEX sport_self_assessments_student_id_sport_id_key ON public.sport_self_assessments USING btree (student_id, sport_id)                                                     |
| public              | student_selections          | student_selections_pkey                                       | CREATE UNIQUE INDEX student_selections_pkey ON public.student_selections USING btree (id)                                                                                                  |
| public              | student_selections          | uq_selection_slot                                             | CREATE UNIQUE INDEX uq_selection_slot ON public.student_selections USING btree (season_id, house_id, sport_id, category, rank)                                                             |
| public              | student_selections          | idx_student_selections_student_id                             | CREATE INDEX idx_student_selections_student_id ON public.student_selections USING btree (student_id)                                                                                       |
| public              | matches                     | idx_matches_season_event                                      | CREATE INDEX idx_matches_season_event ON public.matches USING btree (season_id, event_id)                                                                                                  |
| public              | student_selections          | idx_student_selections_season_sport_cat                       | CREATE INDEX idx_student_selections_season_sport_cat ON public.student_selections USING btree (season_id, sport_id, category)                                                              |
| public              | student_selections          | idx_student_selections_house                                  | CREATE INDEX idx_student_selections_house ON public.student_selections USING btree (house_id)                                                                                              |
| public              | team_standings              | idx_team_standings_season_event                               | CREATE INDEX idx_team_standings_season_event ON public.team_standings USING btree (season_id, event_id)                                                                                    |
| public              | seasons                     | one_active_season                                             | CREATE UNIQUE INDEX one_active_season ON public.seasons USING btree (is_active) WHERE (is_active = true)                                                                                   |
| public              | sports_interests            | sports_interests_pkey                                         | CREATE UNIQUE INDEX sports_interests_pkey ON public.sports_interests USING btree (id)                                                                                                      |
| public              | sports_interests            | sports_interests_student_id_sport_id_key                      | CREATE UNIQUE INDEX sports_interests_student_id_sport_id_key ON public.sports_interests USING btree (student_id, sport_id)                                                                 |
| public              | clubs                       | clubs_pkey                                                    | CREATE UNIQUE INDEX clubs_pkey ON public.clubs USING btree (id)                                                                                                                            |
| public              | club_members                | club_members_pkey                                             | CREATE UNIQUE INDEX club_members_pkey ON public.club_members USING btree (id)                                                                                                              |
| public              | club_members                | club_members_club_id_student_id_key                           | CREATE UNIQUE INDEX club_members_club_id_student_id_key ON public.club_members USING btree (club_id, student_id)                                                                           |
| public              | club_events                 | club_events_pkey                                              | CREATE UNIQUE INDEX club_events_pkey ON public.club_events USING btree (id)                                                                                                                |
| public              | club_event_participants     | club_event_participants_pkey                                  | CREATE UNIQUE INDEX club_event_participants_pkey ON public.club_event_participants USING btree (id)                                                                                        |
| public              | club_event_participants     | club_event_participants_club_event_id_student_id_key          | CREATE UNIQUE INDEX club_event_participants_club_event_id_student_id_key ON public.club_event_participants USING btree (club_event_id, student_id)                                         |
| public              | match_requests              | match_requests_pkey                                           | CREATE UNIQUE INDEX match_requests_pkey ON public.match_requests USING btree (id)                                                                                                          |
| public              | match_request_players       | match_request_players_pkey                                    | CREATE UNIQUE INDEX match_request_players_pkey ON public.match_request_players USING btree (id)                                                                                            |
| public              | match_request_players       | match_request_players_request_id_student_id_key               | CREATE UNIQUE INDEX match_request_players_request_id_student_id_key ON public.match_request_players USING btree (request_id, student_id)                                                   |
| public              | student_sport_scores        | student_sport_scores_pkey                                     | CREATE UNIQUE INDEX student_sport_scores_pkey ON public.student_sport_scores USING btree (id)                                                                                              |
| public              | student_sport_scores        | student_sport_scores_student_id_sport_id_key                  | CREATE UNIQUE INDEX student_sport_scores_student_id_sport_id_key ON public.student_sport_scores USING btree (student_id, sport_id)                                                         |
| public              | certifications              | certifications_pkey                                           | CREATE UNIQUE INDEX certifications_pkey ON public.certifications USING btree (id)                                                                                                          |
| public              | certifications              | certifications_unique_student_sport_year                      | CREATE UNIQUE INDEX certifications_unique_student_sport_year ON public.certifications USING btree (student_id, sport_id, valid_year)                                                       |
| public              | certifications              | uniq_certificate_number                                       | CREATE UNIQUE INDEX uniq_certificate_number ON public.certifications USING btree (certificate_number)                                                                                      |
| public              | student_sport_proficiencies | uniq_student_sport_proficiency                                | CREATE UNIQUE INDEX uniq_student_sport_proficiency ON public.student_sport_proficiencies USING btree (student_id, sport_id)                                                                |
| public              | student_sport_scores        | idx_student_sport_scores_student                              | CREATE INDEX idx_student_sport_scores_student ON public.student_sport_scores USING btree (student_id)                                                                                      |
| public              | student_sport_scores        | idx_student_sport_scores_sport                                | CREATE INDEX idx_student_sport_scores_sport ON public.student_sport_scores USING btree (sport_id)                                                                                          |
| public              | student_sport_scores        | idx_student_sport_scores_total_desc                           | CREATE INDEX idx_student_sport_scores_total_desc ON public.student_sport_scores USING btree (total_score DESC)                                                                             |
| public              | club_event_participants     | idx_club_event_participants_student                           | CREATE INDEX idx_club_event_participants_student ON public.club_event_participants USING btree (student_id)                                                                                |
| public              | club_event_participants     | idx_club_event_participants_event                             | CREATE INDEX idx_club_event_participants_event ON public.club_event_participants USING btree (club_event_id)                                                                               |
| public              | match_request_players       | idx_match_request_players_student                             | CREATE INDEX idx_match_request_players_student ON public.match_request_players USING btree (student_id)                                                                                    |
| public              | match_request_players       | idx_match_request_players_request                             | CREATE INDEX idx_match_request_players_request ON public.match_request_players USING btree (request_id)                                                                                    |
| public              | club_members                | idx_club_members_student                                      | CREATE INDEX idx_club_members_student ON public.club_members USING btree (student_id)                                                                                                      |
| public              | club_members                | idx_club_members_club                                         | CREATE INDEX idx_club_members_club ON public.club_members USING btree (club_id)                                                                                                            |
| public              | sports_interests            | idx_sports_interests_student_sport                            | CREATE INDEX idx_sports_interests_student_sport ON public.sports_interests USING btree (student_id, sport_id)                                                                              |
| public              | match_requests              | idx_match_requests_sport                                      | CREATE INDEX idx_match_requests_sport ON public.match_requests USING btree (sport_id)                                                                                                      |
| public              | match_requests              | idx_match_requests_created_by                                 | CREATE INDEX idx_match_requests_created_by ON public.match_requests USING btree (created_by)                                                                                               |
| public              | club_events                 | idx_club_events_club                                          | CREATE INDEX idx_club_events_club ON public.club_events USING btree (club_id)                                                                                                              |
| public              | certifications              | idx_certifications_student                                    | CREATE INDEX idx_certifications_student ON public.certifications USING btree (student_id)                                                                                                  |
| public              | certifications              | idx_certifications_sport                                      | CREATE INDEX idx_certifications_sport ON public.certifications USING btree (sport_id)                                                                                                      |
| public              | certifications              | idx_certifications_year                                       | CREATE INDEX idx_certifications_year ON public.certifications USING btree (valid_year)                                                                                                     |
| realtime            | messages_2026_03_10         | messages_2026_03_10_pkey                                      | CREATE UNIQUE INDEX messages_2026_03_10_pkey ON realtime.messages_2026_03_10 USING btree (id, inserted_at)                                                                                 |
| realtime            | messages_2026_03_10         | messages_2026_03_10_inserted_at_topic_idx                     | CREATE INDEX messages_2026_03_10_inserted_at_topic_idx ON realtime.messages_2026_03_10 USING btree (inserted_at DESC, topic) WHERE ((extension = 'broadcast'::text) AND (private IS TRUE)) |
| realtime            | messages_2026_03_11         | messages_2026_03_11_pkey                                      | CREATE UNIQUE INDEX messages_2026_03_11_pkey ON realtime.messages_2026_03_11 USING btree (id, inserted_at)                                                                                 |
| realtime            | messages_2026_03_11         | messages_2026_03_11_inserted_at_topic_idx                     | CREATE INDEX messages_2026_03_11_inserted_at_topic_idx ON realtime.messages_2026_03_11 USING btree (inserted_at DESC, topic) WHERE ((extension = 'broadcast'::text) AND (private IS TRUE)) |
| realtime            | messages_2026_03_12         | messages_2026_03_12_pkey                                      | CREATE UNIQUE INDEX messages_2026_03_12_pkey ON realtime.messages_2026_03_12 USING btree (id, inserted_at)                                                                                 |
| realtime            | messages_2026_03_12         | messages_2026_03_12_inserted_at_topic_idx                     | CREATE INDEX messages_2026_03_12_inserted_at_topic_idx ON realtime.messages_2026_03_12 USING btree (inserted_at DESC, topic) WHERE ((extension = 'broadcast'::text) AND (private IS TRUE)) |
| realtime            | messages_2026_03_13         | messages_2026_03_13_pkey                                      | CREATE UNIQUE INDEX messages_2026_03_13_pkey ON realtime.messages_2026_03_13 USING btree (id, inserted_at)                                                                                 |
| realtime            | messages_2026_03_13         | messages_2026_03_13_inserted_at_topic_idx                     | CREATE INDEX messages_2026_03_13_inserted_at_topic_idx ON realtime.messages_2026_03_13 USING btree (inserted_at DESC, topic) WHERE ((extension = 'broadcast'::text) AND (private IS TRUE)) |
| realtime            | messages_2026_03_14         | messages_2026_03_14_pkey                                      | CREATE UNIQUE INDEX messages_2026_03_14_pkey ON realtime.messages_2026_03_14 USING btree (id, inserted_at)                                                                                 |
| realtime            | messages_2026_03_14         | messages_2026_03_14_inserted_at_topic_idx                     | CREATE INDEX messages_2026_03_14_inserted_at_topic_idx ON realtime.messages_2026_03_14 USING btree (inserted_at DESC, topic) WHERE ((extension = 'broadcast'::text) AND (private IS TRUE)) |
| public              | profiles                    | profiles_pkey                                                 | CREATE UNIQUE INDEX profiles_pkey ON public.profiles USING btree (tr_number)                                                                                                               |
| public              | profiles                    | profiles_user_id_key                                          | CREATE UNIQUE INDEX profiles_user_id_key ON public.profiles USING btree (user_id)                                                                                                          |
| public              | profiles                    | profiles_edu_email_key                                        | CREATE UNIQUE INDEX profiles_edu_email_key ON public.profiles USING btree (edu_email)                                                                                                      |
| public              | team_members                | team_members_pkey                                             | CREATE UNIQUE INDEX team_members_pkey ON public.team_members USING btree (id)                                                                                                              |
| public              | team_members                | team_members_team_id_student_tr_key                           | CREATE UNIQUE INDEX team_members_team_id_student_tr_key ON public.team_members USING btree (team_id, student_tr)                                                                           |
| public              | participations              | participations_pkey                                           | CREATE UNIQUE INDEX participations_pkey ON public.participations USING btree (id)                                                                                                          |
| public              | student_event_roles         | student_event_roles_pkey                                      | CREATE UNIQUE INDEX student_event_roles_pkey ON public.student_event_roles USING btree (id)                                                                                                |
| public              | student_event_roles         | student_event_roles_student_tr_event_id_role_key              | CREATE UNIQUE INDEX student_event_roles_student_tr_event_id_role_key ON public.student_event_roles USING btree (student_tr, event_id, role)                                                |
| public              | point_transactions          | point_transactions_pkey                                       | CREATE UNIQUE INDEX point_transactions_pkey ON public.point_transactions USING btree (id)                                                                                                  |
| public              | training_attendance         | training_attendance_pkey                                      | CREATE UNIQUE INDEX training_attendance_pkey ON public.training_attendance USING btree (id)                                                                                                |
| public              | training_attendance         | training_attendance_training_id_student_tr_key                | CREATE UNIQUE INDEX training_attendance_training_id_student_tr_key ON public.training_attendance USING btree (training_id, student_tr)                                                     |
| public              | achievements                | achievements_pkey                                             | CREATE UNIQUE INDEX achievements_pkey ON public.achievements USING btree (id)                                                                                                              |
| public              | fitness_logs                | fitness_logs_pkey                                             | CREATE UNIQUE INDEX fitness_logs_pkey ON public.fitness_logs USING btree (id)                                                                                                              |
| public              | profiles                    | profiles_its_number_key                                       | CREATE UNIQUE INDEX profiles_its_number_key ON public.profiles USING btree (its_number)                                                                                                    |
| realtime            | messages_2026_03_15         | messages_2026_03_15_pkey                                      | CREATE UNIQUE INDEX messages_2026_03_15_pkey ON realtime.messages_2026_03_15 USING btree (id, inserted_at)                                                                                 |
| realtime            | messages_2026_03_15         | messages_2026_03_15_inserted_at_topic_idx                     | CREATE INDEX messages_2026_03_15_inserted_at_topic_idx ON realtime.messages_2026_03_15 USING btree (inserted_at DESC, topic) WHERE ((extension = 'broadcast'::text) AND (private IS TRUE)) |



# Contrains
| constraint_name                                  | table_name                  | definition                                                                                                                                  |
| ------------------------------------------------ | --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| cardinal_number_domain_check                     | -                           | CHECK ((VALUE >= 0))                                                                                                                        |
| yes_or_no_check                                  | -                           | CHECK (((VALUE)::text = ANY ((ARRAY['YES'::character varying, 'NO'::character varying])::text[])))                                          |
| users_email_change_confirm_status_check          | auth.users                  | CHECK (((email_change_confirm_status >= 0) AND (email_change_confirm_status <= 2)))                                                         |
| resource_id not empty                            | auth.sso_providers          | CHECK (((resource_id = NULL::text) OR (char_length(resource_id) > 0)))                                                                      |
| domain not empty                                 | auth.sso_domains            | CHECK ((char_length(domain) > 0))                                                                                                           |
| metadata_xml not empty                           | auth.saml_providers         | CHECK ((char_length(metadata_xml) > 0))                                                                                                     |
| metadata_url not empty                           | auth.saml_providers         | CHECK (((metadata_url = NULL::text) OR (char_length(metadata_url) > 0)))                                                                    |
| entity_id not empty                              | auth.saml_providers         | CHECK ((char_length(entity_id) > 0))                                                                                                        |
| request_id not empty                             | auth.saml_relay_states      | CHECK ((char_length(request_id) > 0))                                                                                                       |
| one_time_tokens_token_hash_check                 | auth.one_time_tokens        | CHECK ((char_length(token_hash) > 0))                                                                                                       |
| oauth_clients_client_name_length                 | auth.oauth_clients          | CHECK ((char_length(client_name) <= 1024))                                                                                                  |
| oauth_clients_client_uri_length                  | auth.oauth_clients          | CHECK ((char_length(client_uri) <= 2048))                                                                                                   |
| oauth_clients_logo_uri_length                    | auth.oauth_clients          | CHECK ((char_length(logo_uri) <= 2048))                                                                                                     |
| oauth_authorizations_redirect_uri_length         | auth.oauth_authorizations   | CHECK ((char_length(redirect_uri) <= 2048))                                                                                                 |
| oauth_authorizations_scope_length                | auth.oauth_authorizations   | CHECK ((char_length(scope) <= 4096))                                                                                                        |
| oauth_authorizations_state_length                | auth.oauth_authorizations   | CHECK ((char_length(state) <= 4096))                                                                                                        |
| oauth_authorizations_resource_length             | auth.oauth_authorizations   | CHECK ((char_length(resource) <= 2048))                                                                                                     |
| oauth_authorizations_code_challenge_length       | auth.oauth_authorizations   | CHECK ((char_length(code_challenge) <= 128))                                                                                                |
| oauth_authorizations_authorization_code_length   | auth.oauth_authorizations   | CHECK ((char_length(authorization_code) <= 255))                                                                                            |
| oauth_authorizations_expires_at_future           | auth.oauth_authorizations   | CHECK ((expires_at > created_at))                                                                                                           |
| oauth_consents_scopes_length                     | auth.oauth_consents         | CHECK ((char_length(scopes) <= 2048))                                                                                                       |
| oauth_consents_scopes_not_empty                  | auth.oauth_consents         | CHECK ((char_length(TRIM(BOTH FROM scopes)) > 0))                                                                                           |
| oauth_consents_revoked_after_granted             | auth.oauth_consents         | CHECK (((revoked_at IS NULL) OR (revoked_at >= granted_at)))                                                                                |
| oauth_authorizations_nonce_length                | auth.oauth_authorizations   | CHECK ((char_length(nonce) <= 255))                                                                                                         |
| sessions_scopes_length                           | auth.sessions               | CHECK ((char_length(scopes) <= 4096))                                                                                                       |
| oauth_clients_token_endpoint_auth_method_check   | auth.oauth_clients          | CHECK ((token_endpoint_auth_method = ANY (ARRAY['client_secret_basic'::text, 'client_secret_post'::text, 'none'::text])))                   |
| subscription_action_filter_check                 | realtime.subscription       | CHECK ((action_filter = ANY (ARRAY['*'::text, 'INSERT'::text, 'UPDATE'::text, 'DELETE'::text])))                                            |
| custom_oauth_providers_provider_type_check       | auth.custom_oauth_providers | CHECK ((provider_type = ANY (ARRAY['oauth2'::text, 'oidc'::text])))                                                                         |
| custom_oauth_providers_oidc_requires_issuer      | auth.custom_oauth_providers | CHECK (((provider_type <> 'oidc'::text) OR (issuer IS NOT NULL)))                                                                           |
| custom_oauth_providers_oidc_issuer_https         | auth.custom_oauth_providers | CHECK (((provider_type <> 'oidc'::text) OR (issuer IS NULL) OR (issuer ~~ 'https://%'::text)))                                              |
| custom_oauth_providers_oidc_discovery_url_https  | auth.custom_oauth_providers | CHECK (((provider_type <> 'oidc'::text) OR (discovery_url IS NULL) OR (discovery_url ~~ 'https://%'::text)))                                |
| custom_oauth_providers_oauth2_requires_endpoints | auth.custom_oauth_providers | CHECK (((provider_type <> 'oauth2'::text) OR ((authorization_url IS NOT NULL) AND (token_url IS NOT NULL) AND (userinfo_url IS NOT NULL)))) |
| custom_oauth_providers_authorization_url_https   | auth.custom_oauth_providers | CHECK (((authorization_url IS NULL) OR (authorization_url ~~ 'https://%'::text)))                                                           |
| custom_oauth_providers_token_url_https           | auth.custom_oauth_providers | CHECK (((token_url IS NULL) OR (token_url ~~ 'https://%'::text)))                                                                           |
| custom_oauth_providers_userinfo_url_https        | auth.custom_oauth_providers | CHECK (((userinfo_url IS NULL) OR (userinfo_url ~~ 'https://%'::text)))                                                                     |
| custom_oauth_providers_jwks_uri_https            | auth.custom_oauth_providers | CHECK (((jwks_uri IS NULL) OR (jwks_uri ~~ 'https://%'::text)))                                                                             |
| custom_oauth_providers_identifier_format         | auth.custom_oauth_providers | CHECK ((identifier ~ '^[a-z0-9][a-z0-9:-]{0,48}[a-z0-9]$'::text))                                                                           |
| custom_oauth_providers_name_length               | auth.custom_oauth_providers | CHECK (((char_length(name) >= 1) AND (char_length(name) <= 100)))                                                                           |
| custom_oauth_providers_issuer_length             | auth.custom_oauth_providers | CHECK (((issuer IS NULL) OR ((char_length(issuer) >= 1) AND (char_length(issuer) <= 2048))))                                                |
| custom_oauth_providers_discovery_url_length      | auth.custom_oauth_providers | CHECK (((discovery_url IS NULL) OR (char_length(discovery_url) <= 2048)))                                                                   |
| custom_oauth_providers_authorization_url_length  | auth.custom_oauth_providers | CHECK (((authorization_url IS NULL) OR (char_length(authorization_url) <= 2048)))                                                           |
| custom_oauth_providers_token_url_length          | auth.custom_oauth_providers | CHECK (((token_url IS NULL) OR (char_length(token_url) <= 2048)))                                                                           |
| custom_oauth_providers_userinfo_url_length       | auth.custom_oauth_providers | CHECK (((userinfo_url IS NULL) OR (char_length(userinfo_url) <= 2048)))                                                                     |
| custom_oauth_providers_jwks_uri_length           | auth.custom_oauth_providers | CHECK (((jwks_uri IS NULL) OR (char_length(jwks_uri) <= 2048)))                                                                             |
| custom_oauth_providers_client_id_length          | auth.custom_oauth_providers | CHECK (((char_length(client_id) >= 1) AND (char_length(client_id) <= 512)))                                                                 |
| student_sport_proficiencies_source_check         | student_sport_proficiencies | CHECK ((source = ANY (ARRAY['self'::text, 'admin'::text, 'computed'::text])))                                                               |
| sport_self_assessments_skill_rating_check        | sport_self_assessments      | CHECK (((skill_rating >= 1) AND (skill_rating <= 5)))                                                                                       |



# RLS
| schemaname | tablename                   | policyname                                | permissive | roles           | cmd    | qual                                                                        | with_check                                                                  |
| ---------- | --------------------------- | ----------------------------------------- | ---------- | --------------- | ------ | --------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| public     | profiles                    | Public profiles are viewable by everyone  | PERMISSIVE | {public}        | SELECT | true                                                                        | null                                                                        |
| public     | profiles                    | Users can update own profile              | PERMISSIVE | {public}        | UPDATE | (auth.uid() = user_id)                                                      | null                                                                        |
| public     | user_roles                  | Roles are viewable by authenticated users | PERMISSIVE | {authenticated} | SELECT | true                                                                        | null                                                                        |
| storage    | objects                     | Avatar images are publicly accessible     | PERMISSIVE | {public}        | SELECT | (bucket_id = 'avatars'::text)                                               | null                                                                        |
| storage    | objects                     | Admins can upload avatars                 | PERMISSIVE | {public}        | INSERT | null                                                                        | ((bucket_id = 'avatars'::text) AND has_role(auth.uid(), 'admin'::app_role)) |
| storage    | objects                     | Admins can update avatars                 | PERMISSIVE | {public}        | UPDATE | ((bucket_id = 'avatars'::text) AND has_role(auth.uid(), 'admin'::app_role)) | null                                                                        |
| storage    | objects                     | Admins can delete avatars                 | PERMISSIVE | {public}        | DELETE | ((bucket_id = 'avatars'::text) AND has_role(auth.uid(), 'admin'::app_role)) | null                                                                        |
| public     | club_members                | Anyone can read club_members              | PERMISSIVE | {authenticated} | SELECT | true                                                                        | null                                                                        |
| public     | student_sport_scores        | Admins manage student_sport_scores        | PERMISSIVE | {authenticated} | ALL    | has_role(auth.uid(), 'admin'::app_role)                                     | has_role(auth.uid(), 'admin'::app_role)                                     |
| public     | student_sport_scores        | Coaches manage student_sport_scores       | PERMISSIVE | {authenticated} | ALL    | has_role(auth.uid(), 'coach'::app_role)                                     | has_role(auth.uid(), 'coach'::app_role)                                     |
| public     | student_sport_scores        | Anyone can read student_sport_scores      | PERMISSIVE | {authenticated} | SELECT | true                                                                        | null                                                                        |
| public     | sports_interests            | Admins manage sports_interests            | PERMISSIVE | {authenticated} | ALL    | has_role(auth.uid(), 'admin'::app_role)                                     | has_role(auth.uid(), 'admin'::app_role)                                     |
| public     | club_event_participants     | Anyone can read club_event_participants   | PERMISSIVE | {authenticated} | SELECT | true                                                                        | null                                                                        |
| public     | sports_interests            | Coaches manage sports_interests           | PERMISSIVE | {authenticated} | ALL    | has_role(auth.uid(), 'coach'::app_role)                                     | has_role(auth.uid(), 'coach'::app_role)                                     |
| public     | seasons                     | Admins manage seasons                     | PERMISSIVE | {authenticated} | ALL    | has_role(auth.uid(), 'admin'::app_role)                                     | has_role(auth.uid(), 'admin'::app_role)                                     |
| public     | seasons                     | Anyone can read seasons                   | PERMISSIVE | {authenticated} | SELECT | true                                                                        | null                                                                        |
| public     | match_request_players       | Admins manage match_request_players       | PERMISSIVE | {authenticated} | ALL    | has_role(auth.uid(), 'admin'::app_role)                                     | has_role(auth.uid(), 'admin'::app_role)                                     |
| public     | match_request_players       | Authenticated read match_request_players  | PERMISSIVE | {authenticated} | SELECT | true                                                                        | null                                                                        |
| public     | houses                      | Admins manage houses                      | PERMISSIVE | {authenticated} | ALL    | has_role(auth.uid(), 'admin'::app_role)                                     | has_role(auth.uid(), 'admin'::app_role)                                     |
| public     | houses                      | Anyone can read houses                    | PERMISSIVE | {authenticated} | SELECT | true                                                                        | null                                                                        |
| public     | student_sport_proficiencies | Admins manage proficiencies               | PERMISSIVE | {authenticated} | ALL    | has_role(auth.uid(), 'admin'::app_role)                                     | has_role(auth.uid(), 'admin'::app_role)                                     |
| public     | student_sport_proficiencies | Coaches manage proficiencies              | PERMISSIVE | {authenticated} | ALL    | has_role(auth.uid(), 'coach'::app_role)                                     | has_role(auth.uid(), 'coach'::app_role)                                     |
| public     | student_sport_proficiencies | Anyone can read proficiencies             | PERMISSIVE | {authenticated} | SELECT | true                                                                        | null                                                                        |
| public     | team_standings              | Admins manage team_standings              | PERMISSIVE | {authenticated} | ALL    | has_role(auth.uid(), 'admin'::app_role)                                     | has_role(auth.uid(), 'admin'::app_role)                                     |
| public     | team_standings              | Coaches manage team_standings             | PERMISSIVE | {authenticated} | ALL    | has_role(auth.uid(), 'coach'::app_role)                                     | has_role(auth.uid(), 'coach'::app_role)                                     |
| public     | team_standings              | Anyone can read team_standings            | PERMISSIVE | {authenticated} | SELECT | true                                                                        | null                                                                        |
| public     | match_requests              | Admins manage match_requests              | PERMISSIVE | {authenticated} | ALL    | has_role(auth.uid(), 'admin'::app_role)                                     | has_role(auth.uid(), 'admin'::app_role)                                     |
| public     | match_requests              | Authenticated read match_requests         | PERMISSIVE | {authenticated} | SELECT | true                                                                        | null                                                                        |
| public     | student_selections          | Admins full access student_selections     | PERMISSIVE | {authenticated} | ALL    | has_role(auth.uid(), 'admin'::app_role)                                     | has_role(auth.uid(), 'admin'::app_role)                                     |
| public     | teams                       | Anyone can read teams                     | PERMISSIVE | {authenticated} | SELECT | true                                                                        | null                                                                        |
| public     | hizb                        | Admins manage hizb                        | PERMISSIVE | {authenticated} | ALL    | has_role(auth.uid(), 'admin'::app_role)                                     | has_role(auth.uid(), 'admin'::app_role)                                     |
| public     | hizb                        | Anyone can read hizb                      | PERMISSIVE | {authenticated} | SELECT | true                                                                        | null                                                                        |
| public     | certifications              | Admins manage certifications              | PERMISSIVE | {authenticated} | ALL    | has_role(auth.uid(), 'admin'::app_role)                                     | has_role(auth.uid(), 'admin'::app_role)                                     |
| public     | certifications              | Anyone can read issued certifications     | PERMISSIVE | {authenticated} | SELECT | (status = 'issued'::certification_status)                                   | null                                                                        |
| public     | user_roles                  | Admins manage user_roles                  | PERMISSIVE | {authenticated} | ALL    | has_role(auth.uid(), 'admin'::app_role)                                     | has_role(auth.uid(), 'admin'::app_role)                                     |
| public     | user_roles                  | Users read own roles                      | PERMISSIVE | {authenticated} | SELECT | (auth.uid() = user_id)                                                      | null                                                                        |
| public     | trainings                   | Admins manage trainings                   | PERMISSIVE | {authenticated} | ALL    | has_role(auth.uid(), 'admin'::app_role)                                     | has_role(auth.uid(), 'admin'::app_role)                                     |
| public     | trainings                   | Anyone can read trainings                 | PERMISSIVE | {authenticated} | SELECT | true                                                                        | null                                                                        |
| public     | club_members                | Admins manage club_members                | PERMISSIVE | {authenticated} | ALL    | has_role(auth.uid(), 'admin'::app_role)                                     | has_role(auth.uid(), 'admin'::app_role)                                     |
| public     | club_members                | Coaches manage club_members               | PERMISSIVE | {authenticated} | ALL    | has_role(auth.uid(), 'coach'::app_role)                                     | has_role(auth.uid(), 'coach'::app_role)                                     |
| public     | matches                     | Admins manage matches                     | PERMISSIVE | {authenticated} | ALL    | has_role(auth.uid(), 'admin'::app_role)                                     | has_role(auth.uid(), 'admin'::app_role)                                     |
| public     | matches                     | Coaches manage matches                    | PERMISSIVE | {authenticated} | ALL    | has_role(auth.uid(), 'coach'::app_role)                                     | has_role(auth.uid(), 'coach'::app_role)                                     |
| public     | matches                     | Anyone can read matches                   | PERMISSIVE | {authenticated} | SELECT | true                                                                        | null                                                                        |
| public     | wildcard_programs           | Admins manage wildcard_programs           | PERMISSIVE | {authenticated} | ALL    | has_role(auth.uid(), 'admin'::app_role)                                     | has_role(auth.uid(), 'admin'::app_role)                                     |
| public     | wildcard_programs           | Anyone can read wildcard_programs         | PERMISSIVE | {authenticated} | SELECT | true                                                                        | null                                                                        |
| public     | sport_self_assessments      | Admins manage assessments                 | PERMISSIVE | {authenticated} | ALL    | has_role(auth.uid(), 'admin'::app_role)                                     | has_role(auth.uid(), 'admin'::app_role)                                     |
| public     | sport_self_assessments      | Authenticated users read assessments      | PERMISSIVE | {authenticated} | SELECT | (auth.uid() IS NOT NULL)                                                    | null                                                                        |
| public     | events                      | Admins manage events                      | PERMISSIVE | {authenticated} | ALL    | has_role(auth.uid(), 'admin'::app_role)                                     | has_role(auth.uid(), 'admin'::app_role)                                     |
| public     | events                      | Coaches manage events                     | PERMISSIVE | {authenticated} | ALL    | has_role(auth.uid(), 'coach'::app_role)                                     | has_role(auth.uid(), 'coach'::app_role)                                     |
| public     | events                      | Anyone can read events                    | PERMISSIVE | {authenticated} | SELECT | true                                                                        | null                                                                        |
| public     | club_events                 | Admins manage club_events                 | PERMISSIVE | {authenticated} | ALL    | has_role(auth.uid(), 'admin'::app_role)                                     | has_role(auth.uid(), 'admin'::app_role)                                     |
| public     | club_events                 | Coaches manage club_events                | PERMISSIVE | {authenticated} | ALL    | has_role(auth.uid(), 'coach'::app_role)                                     | has_role(auth.uid(), 'coach'::app_role)                                     |
| public     | club_events                 | Anyone can read club_events               | PERMISSIVE | {authenticated} | SELECT | true                                                                        | null                                                                        |
| public     | sports                      | Admins manage sports                      | PERMISSIVE | {authenticated} | ALL    | has_role(auth.uid(), 'admin'::app_role)                                     | has_role(auth.uid(), 'admin'::app_role)                                     |
| public     | sports                      | Anyone can read sports                    | PERMISSIVE | {authenticated} | SELECT | true                                                                        | null                                                                        |
| public     | club_event_participants     | Admins manage club_event_participants     | PERMISSIVE | {authenticated} | ALL    | has_role(auth.uid(), 'admin'::app_role)                                     | has_role(auth.uid(), 'admin'::app_role)                                     |
| public     | club_event_participants     | Coaches manage club_event_participants    | PERMISSIVE | {authenticated} | ALL    | has_role(auth.uid(), 'coach'::app_role)                                     | has_role(auth.uid(), 'coach'::app_role)                                     |
| public     | clubs                       | Admins manage clubs                       | PERMISSIVE | {authenticated} | ALL    | has_role(auth.uid(), 'admin'::app_role)                                     | has_role(auth.uid(), 'admin'::app_role)                                     |
| public     | clubs                       | Coaches manage clubs                      | PERMISSIVE | {authenticated} | ALL    | has_role(auth.uid(), 'coach'::app_role)                                     | has_role(auth.uid(), 'coach'::app_role)                                     |
| public     | clubs                       | Anyone can read clubs                     | PERMISSIVE | {authenticated} | SELECT | true                                                                        | null                                                                        |
| public     | teams                       | Admins manage teams                       | PERMISSIVE | {authenticated} | ALL    | has_role(auth.uid(), 'admin'::app_role)                                     | has_role(auth.uid(), 'admin'::app_role)                                     |
| public     | teams                       | Coaches manage teams                      | PERMISSIVE | {authenticated} | ALL    | has_role(auth.uid(), 'coach'::app_role)                                     | has_role(auth.uid(), 'coach'::app_role)                                     |



 # TRiggers 
| table_name                  | trigger_name                               | event_manipulation | action_statement                                          |
| --------------------------- | ------------------------------------------ | ------------------ | --------------------------------------------------------- |
| subscription                | tr_check_filters                           | INSERT             | EXECUTE FUNCTION realtime.subscription_check_filters()    |
| subscription                | tr_check_filters                           | UPDATE             | EXECUTE FUNCTION realtime.subscription_check_filters()    |
| objects                     | update_objects_updated_at                  | UPDATE             | EXECUTE FUNCTION storage.update_updated_at_column()       |
| buckets                     | enforce_bucket_name_length_trigger         | INSERT             | EXECUTE FUNCTION storage.enforce_bucket_name_length()     |
| buckets                     | enforce_bucket_name_length_trigger         | UPDATE             | EXECUTE FUNCTION storage.enforce_bucket_name_length()     |
| buckets                     | protect_buckets_delete                     | DELETE             | EXECUTE FUNCTION storage.protect_delete()                 |
| objects                     | protect_objects_delete                     | DELETE             | EXECUTE FUNCTION storage.protect_delete()                 |
| users                       | on_auth_user_created                       | INSERT             | EXECUTE FUNCTION handle_new_user_linking()                |
| student_sport_proficiencies | update_proficiency_updated_at              | UPDATE             | EXECUTE FUNCTION update_updated_at()                      |
| sports_interests            | update_sports_interests_updated_at         | UPDATE             | EXECUTE FUNCTION update_updated_at()                      |
| club_members                | trg_auto_interest_on_club_join             | INSERT             | EXECUTE FUNCTION auto_interest_on_club_join()             |
| match_request_players       | trg_auto_match_request_status              | INSERT             | EXECUTE FUNCTION auto_match_request_status()              |
| match_request_players       | trg_auto_match_request_reopen              | DELETE             | EXECUTE FUNCTION auto_match_request_reopen()              |
| match_request_players       | trg_auto_interest_on_buddy_match           | INSERT             | EXECUTE FUNCTION auto_interest_on_buddy_match()           |
| certifications              | trg_protect_certificates                   | DELETE             | EXECUTE FUNCTION prevent_certificate_modification()       |
| certifications              | trg_protect_certificates                   | UPDATE             | EXECUTE FUNCTION prevent_certificate_modification()       |
| club_event_participants     | trg_auto_interest_on_club_event_attendance | INSERT             | EXECUTE FUNCTION auto_interest_on_club_event_attendance() |
| club_event_participants     | trg_auto_interest_on_club_event_attendance | UPDATE             | EXECUTE FUNCTION auto_interest_on_club_event_attendance() |
| users                       | on_auth_user_created_link_profile          | INSERT             | EXECUTE FUNCTION handle_new_user_linking()                |


# Functions

| function_name                          | brief                                                                                                                    |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| auto_interest_on_buddy_match           | CREATE OR REPLACE FUNCTION public.auto_interest_on_buddy_match()  RETURNS trigger  LANGUAGE plpgsql  SECURITY DEFINER  S |
| auto_interest_on_club_event_attendance | CREATE OR REPLACE FUNCTION public.auto_interest_on_club_event_attendance()  RETURNS trigger  LANGUAGE plpgsql  SECURITY  |
| auto_interest_on_club_join             | CREATE OR REPLACE FUNCTION public.auto_interest_on_club_join()  RETURNS trigger  LANGUAGE plpgsql  SECURITY DEFINER  SET |
| auto_interest_on_participation         | CREATE OR REPLACE FUNCTION public.auto_interest_on_participation()  RETURNS trigger  LANGUAGE plpgsql  SECURITY DEFINER  |
| auto_interest_on_result                | CREATE OR REPLACE FUNCTION public.auto_interest_on_result()  RETURNS trigger  LANGUAGE plpgsql  SECURITY DEFINER  SET se |
| auto_match_request_reopen              | CREATE OR REPLACE FUNCTION public.auto_match_request_reopen()  RETURNS trigger  LANGUAGE plpgsql  SECURITY DEFINER  SET  |
| auto_match_request_status              | CREATE OR REPLACE FUNCTION public.auto_match_request_status()  RETURNS trigger  LANGUAGE plpgsql  SECURITY DEFINER  SET  |
| calculate_student_sport_score          | CREATE OR REPLACE FUNCTION public.calculate_student_sport_score(p_student_id uuid, p_sport_id uuid)  RETURNS void  LANGU |
| generate_certificate_number            | CREATE OR REPLACE FUNCTION public.generate_certificate_number(p_year integer)  RETURNS text  LANGUAGE plpgsql  SECURITY  |
| handle_new_user_linking                | CREATE OR REPLACE FUNCTION public.handle_new_user_linking()  RETURNS trigger  LANGUAGE plpgsql  SECURITY DEFINER AS $fun |
| has_role                               | CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)  RETURNS boolean  LANGUAGE sql  STABLE SECURIT |
| prevent_certificate_modification       | CREATE OR REPLACE FUNCTION public.prevent_certificate_modification()  RETURNS trigger  LANGUAGE plpgsql  SECURITY DEFINE |
| recalculate_all_sport_scores           | CREATE OR REPLACE FUNCTION public.recalculate_all_sport_scores()  RETURNS integer  LANGUAGE plpgsql  SECURITY DEFINER  S |
| update_updated_at                      | CREATE OR REPLACE FUNCTION public.update_updated_at()  RETURNS trigger  LANGUAGE plpgsql  SET search_path TO 'public' AS |