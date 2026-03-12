| table_name                  | column_name          | data_type                | constraint_type | constraint_name                                      | foreign_table               | foreign_column     |
| --------------------------- | -------------------- | ------------------------ | --------------- | ---------------------------------------------------- | --------------------------- | ------------------ |
| achievements                | id                   | uuid                     | PRIMARY KEY     | achievements_pkey                                    | achievements                | id                 |
| achievements                | student_tr           | bigint                   | FOREIGN KEY     | achievements_student_tr_fkey                         | profiles                    | tr_number          |
| achievements                | title                | text                     | null            | null                                                 | null                        | null               |
| achievements                | description          | text                     | null            | null                                                 | null                        | null               |
| achievements                | icon                 | text                     | null            | null                                                 | null                        | null               |
| achievements                | earned_at            | timestamp with time zone | null            | null                                                 | null                        | null               |
| certifications              | id                   | uuid                     | PRIMARY KEY     | certifications_pkey                                  | certifications              | id                 |
| certifications              | student_tr           | bigint                   | UNIQUE          | certifications_unique_student_sport_year             | certifications              | sport_id           |
| certifications              | student_tr           | bigint                   | UNIQUE          | certifications_unique_student_sport_year             | certifications              | valid_year         |
| certifications              | student_tr           | bigint                   | FOREIGN KEY     | certifications_student_tr_fkey                       | profiles                    | tr_number          |
| certifications              | student_tr           | bigint                   | UNIQUE          | certifications_unique_student_sport_year             | certifications              | student_tr         |
| certifications              | sport_id             | uuid                     | FOREIGN KEY     | certifications_sport_id_fkey                         | sports                      | id                 |
| certifications              | sport_id             | uuid                     | UNIQUE          | certifications_unique_student_sport_year             | certifications              | sport_id           |
| certifications              | sport_id             | uuid                     | UNIQUE          | certifications_unique_student_sport_year             | certifications              | student_tr         |
| certifications              | sport_id             | uuid                     | UNIQUE          | certifications_unique_student_sport_year             | certifications              | valid_year         |
| certifications              | score_snapshot       | integer                  | null            | null                                                 | null                        | null               |
| certifications              | proficiency_level    | USER-DEFINED             | null            | null                                                 | null                        | null               |
| certifications              | certificate_number   | text                     | UNIQUE          | uniq_certificate_number                              | certifications              | certificate_number |
| certifications              | issued_by            | text                     | null            | null                                                 | null                        | null               |
| certifications              | issued_at            | timestamp with time zone | null            | null                                                 | null                        | null               |
| certifications              | valid_year           | integer                  | UNIQUE          | certifications_unique_student_sport_year             | certifications              | student_tr         |
| certifications              | valid_year           | integer                  | UNIQUE          | certifications_unique_student_sport_year             | certifications              | valid_year         |
| certifications              | valid_year           | integer                  | UNIQUE          | certifications_unique_student_sport_year             | certifications              | sport_id           |
| certifications              | notes                | text                     | null            | null                                                 | null                        | null               |
| certifications              | status               | USER-DEFINED             | null            | null                                                 | null                        | null               |
| certifications              | created_at           | timestamp with time zone | null            | null                                                 | null                        | null               |
| club_event_participants     | id                   | uuid                     | PRIMARY KEY     | club_event_participants_pkey                         | club_event_participants     | id                 |
| club_event_participants     | club_event_id        | uuid                     | UNIQUE          | club_event_participants_club_event_id_student_id_key | club_event_participants     | club_event_id      |
| club_event_participants     | club_event_id        | uuid                     | UNIQUE          | club_event_participants_club_event_id_student_id_key | club_event_participants     | student_id         |
| club_event_participants     | club_event_id        | uuid                     | FOREIGN KEY     | club_event_participants_club_event_id_fkey           | club_events                 | id                 |
| club_event_participants     | student_id           | uuid                     | UNIQUE          | club_event_participants_club_event_id_student_id_key | club_event_participants     | club_event_id      |
| club_event_participants     | student_id           | uuid                     | UNIQUE          | club_event_participants_club_event_id_student_id_key | club_event_participants     | student_id         |
| club_event_participants     | status               | USER-DEFINED             | null            | null                                                 | null                        | null               |
| club_event_participants     | joined_at            | timestamp with time zone | null            | null                                                 | null                        | null               |
| club_events                 | id                   | uuid                     | PRIMARY KEY     | club_events_pkey                                     | club_events                 | id                 |
| club_events                 | club_id              | uuid                     | FOREIGN KEY     | club_events_club_id_fkey                             | clubs                       | id                 |
| club_events                 | title                | text                     | null            | null                                                 | null                        | null               |
| club_events                 | description          | text                     | null            | null                                                 | null                        | null               |
| club_events                 | event_type           | USER-DEFINED             | null            | null                                                 | null                        | null               |
| club_events                 | event_date           | timestamp with time zone | null            | null                                                 | null                        | null               |
| club_events                 | location             | text                     | null            | null                                                 | null                        | null               |
| club_events                 | max_participants     | integer                  | null            | null                                                 | null                        | null               |
| club_events                 | created_by           | uuid                     | null            | null                                                 | null                        | null               |
| club_events                 | created_at           | timestamp with time zone | null            | null                                                 | null                        | null               |
| club_members                | id                   | uuid                     | PRIMARY KEY     | club_members_pkey                                    | club_members                | id                 |
| club_members                | club_id              | uuid                     | FOREIGN KEY     | club_members_club_id_fkey                            | clubs                       | id                 |
| club_members                | club_id              | uuid                     | UNIQUE          | club_members_club_id_student_id_key                  | club_members                | club_id            |
| club_members                | club_id              | uuid                     | UNIQUE          | club_members_club_id_student_id_key                  | club_members                | student_id         |
| club_members                | student_id           | uuid                     | UNIQUE          | club_members_club_id_student_id_key                  | club_members                | club_id            |
| club_members                | student_id           | uuid                     | UNIQUE          | club_members_club_id_student_id_key                  | club_members                | student_id         |
| club_members                | role                 | USER-DEFINED             | null            | null                                                 | null                        | null               |
| club_members                | status               | USER-DEFINED             | null            | null                                                 | null                        | null               |
| club_members                | joined_at            | timestamp with time zone | null            | null                                                 | null                        | null               |
| clubs                       | id                   | uuid                     | PRIMARY KEY     | clubs_pkey                                           | clubs                       | id                 |
| clubs                       | sport_id             | uuid                     | FOREIGN KEY     | clubs_sport_id_fkey                                  | sports                      | id                 |
| clubs                       | name                 | text                     | null            | null                                                 | null                        | null               |
| clubs                       | description          | text                     | null            | null                                                 | null                        | null               |
| clubs                       | incharge_id          | bigint                   | FOREIGN KEY     | clubs_incharge_id_fkey                               | profiles                    | tr_number          |
| clubs                       | sub_incharge_id      | bigint                   | FOREIGN KEY     | clubs_sub_incharge_id_fkey                           | profiles                    | tr_number          |
| clubs                       | created_by           | bigint                   | FOREIGN KEY     | clubs_created_by_fkey                                | profiles                    | tr_number          |
| clubs                       | is_active            | boolean                  | null            | null                                                 | null                        | null               |
| clubs                       | created_at           | timestamp with time zone | null            | null                                                 | null                        | null               |
| events                      | id                   | uuid                     | PRIMARY KEY     | events_pkey                                          | events                      | id                 |
| events                      | sport_id             | uuid                     | FOREIGN KEY     | events_sport_id_fkey                                 | sports                      | id                 |
| events                      | season_id            | uuid                     | FOREIGN KEY     | events_season_id_fkey                                | seasons                     | id                 |
| events                      | name                 | text                     | null            | null                                                 | null                        | null               |
| events                      | sub_category         | text                     | null            | null                                                 | null                        | null               |
| events                      | level                | USER-DEFINED             | null            | null                                                 | null                        | null               |
| events                      | age_group            | text                     | null            | null                                                 | null                        | null               |
| events                      | quota_per_house      | integer                  | null            | null                                                 | null                        | null               |
| events                      | playing_lineup       | integer                  | null            | null                                                 | null                        | null               |
| events                      | reserved_u18         | integer                  | null            | null                                                 | null                        | null               |
| events                      | substitutes          | integer                  | null            | null                                                 | null                        | null               |
| events                      | total_players        | integer                  | null            | null                                                 | null                        | null               |
| events                      | group_stage_desc     | text                     | null            | null                                                 | null                        | null               |
| events                      | playoff_desc         | text                     | null            | null                                                 | null                        | null               |
| events                      | points_1st           | integer                  | null            | null                                                 | null                        | null               |
| events                      | points_2nd           | integer                  | null            | null                                                 | null                        | null               |
| events                      | points_3rd           | integer                  | null            | null                                                 | null                        | null               |
| events                      | points_4th           | integer                  | null            | null                                                 | null                        | null               |
| events                      | participation_points | integer                  | null            | null                                                 | null                        | null               |
| events                      | is_team_event        | boolean                  | null            | null                                                 | null                        | null               |
| events                      | created_at           | timestamp with time zone | null            | null                                                 | null                        | null               |
| events                      | top_8_points         | integer                  | null            | null                                                 | null                        | null               |
| fitness_logs                | id                   | uuid                     | PRIMARY KEY     | fitness_logs_pkey                                    | fitness_logs                | id                 |
| fitness_logs                | student_tr           | bigint                   | FOREIGN KEY     | fitness_logs_student_tr_fkey                         | profiles                    | tr_number          |
| fitness_logs                | speed                | numeric                  | null            | null                                                 | null                        | null               |
| fitness_logs                | agility              | numeric                  | null            | null                                                 | null                        | null               |
| fitness_logs                | endurance            | numeric                  | null            | null                                                 | null                        | null               |
| fitness_logs                | strength             | numeric                  | null            | null                                                 | null                        | null               |
| fitness_logs                | flexibility          | numeric                  | null            | null                                                 | null                        | null               |
| fitness_logs                | logged_at            | timestamp with time zone | null            | null                                                 | null                        | null               |
| hizb                        | id                   | uuid                     | PRIMARY KEY     | hizb_pkey                                            | hizb                        | id                 |
| hizb                        | name                 | text                     | null            | null                                                 | null                        | null               |
| hizb                        | house_id             | uuid                     | FOREIGN KEY     | hizb_house_id_fkey                                   | houses                      | id                 |
| hizb                        | created_at           | timestamp with time zone | null            | null                                                 | null                        | null               |
| house_leaderboard_view      | season_id            | uuid                     | null            | null                                                 | null                        | null               |
| house_leaderboard_view      | house_id             | uuid                     | null            | null                                                 | null                        | null               |
| house_leaderboard_view      | house_name           | text                     | null            | null                                                 | null                        | null               |
| house_leaderboard_view      | house_color          | text                     | null            | null                                                 | null                        | null               |
| house_leaderboard_view      | total_points         | integer                  | null            | null                                                 | null                        | null               |
| house_leaderboard_view      | placement_points     | integer                  | null            | null                                                 | null                        | null               |
| house_leaderboard_view      | participation_points | integer                  | null            | null                                                 | null                        | null               |
| house_leaderboard_view      | bonus_points         | integer                  | null            | null                                                 | null                        | null               |
| house_leaderboard_view      | member_count         | integer                  | null            | null                                                 | null                        | null               |
| houses                      | id                   | uuid                     | PRIMARY KEY     | houses_pkey                                          | houses                      | id                 |
| houses                      | name                 | text                     | UNIQUE          | houses_name_key                                      | houses                      | name               |
| houses                      | color                | text                     | null            | null                                                 | null                        | null               |
| houses                      | created_at           | timestamp with time zone | null            | null                                                 | null                        | null               |
| match_request_players       | id                   | uuid                     | PRIMARY KEY     | match_request_players_pkey                           | match_request_players       | id                 |
| match_request_players       | request_id           | uuid                     | UNIQUE          | match_request_players_request_id_student_id_key      | match_request_players       | request_id         |
| match_request_players       | request_id           | uuid                     | FOREIGN KEY     | match_request_players_request_id_fkey                | match_requests              | id                 |
| match_request_players       | request_id           | uuid                     | UNIQUE          | match_request_players_request_id_student_id_key      | match_request_players       | student_id         |
| match_request_players       | student_id           | uuid                     | UNIQUE          | match_request_players_request_id_student_id_key      | match_request_players       | student_id         |
| match_request_players       | student_id           | uuid                     | UNIQUE          | match_request_players_request_id_student_id_key      | match_request_players       | request_id         |
| match_request_players       | joined_at            | timestamp with time zone | null            | null                                                 | null                        | null               |
| match_requests              | id                   | uuid                     | PRIMARY KEY     | match_requests_pkey                                  | match_requests              | id                 |
| match_requests              | sport_id             | uuid                     | FOREIGN KEY     | match_requests_sport_id_fkey                         | sports                      | id                 |
| match_requests              | created_by           | bigint                   | FOREIGN KEY     | match_requests_created_by_fkey                       | profiles                    | tr_number          |
| match_requests              | title                | text                     | null            | null                                                 | null                        | null               |
| match_requests              | description          | text                     | null            | null                                                 | null                        | null               |
| match_requests              | event_date           | timestamp with time zone | null            | null                                                 | null                        | null               |
| match_requests              | location             | text                     | null            | null                                                 | null                        | null               |
| match_requests              | max_players          | integer                  | null            | null                                                 | null                        | null               |
| match_requests              | status               | USER-DEFINED             | null            | null                                                 | null                        | null               |
| match_requests              | created_at           | timestamp with time zone | null            | null                                                 | null                        | null               |
| matches                     | id                   | uuid                     | PRIMARY KEY     | matches_pkey                                         | matches                     | id                 |
| matches                     | season_id            | uuid                     | FOREIGN KEY     | matches_season_id_fkey                               | seasons                     | id                 |
| matches                     | event_id             | uuid                     | FOREIGN KEY     | matches_event_id_fkey                                | events                      | id                 |
| matches                     | match_date           | timestamp with time zone | null            | null                                                 | null                        | null               |
| matches                     | stage                | USER-DEFINED             | null            | null                                                 | null                        | null               |
| matches                     | home_team_id         | uuid                     | FOREIGN KEY     | matches_home_team_id_fkey                            | teams                       | id                 |
| matches                     | away_team_id         | uuid                     | FOREIGN KEY     | matches_away_team_id_fkey                            | teams                       | id                 |
| matches                     | home_score           | numeric                  | null            | null                                                 | null                        | null               |
| matches                     | away_score           | numeric                  | null            | null                                                 | null                        | null               |
| matches                     | winner_team_id       | uuid                     | FOREIGN KEY     | matches_winner_team_id_fkey                          | teams                       | id                 |
| matches                     | home_runs_for        | numeric                  | null            | null                                                 | null                        | null               |
| matches                     | home_overs_faced     | numeric                  | null            | null                                                 | null                        | null               |
| matches                     | away_runs_for        | numeric                  | null            | null                                                 | null                        | null               |
| matches                     | away_overs_faced     | numeric                  | null            | null                                                 | null                        | null               |
| matches                     | created_at           | timestamp with time zone | null            | null                                                 | null                        | null               |
| participations              | id                   | uuid                     | PRIMARY KEY     | participations_pkey                                  | participations              | id                 |
| participations              | season_id            | uuid                     | FOREIGN KEY     | participations_season_id_fkey                        | seasons                     | id                 |
| participations              | event_id             | uuid                     | FOREIGN KEY     | participations_event_id_fkey                         | events                      | id                 |
| participations              | student_tr           | bigint                   | FOREIGN KEY     | participations_student_tr_fkey                       | profiles                    | tr_number          |
| participations              | team_id              | uuid                     | FOREIGN KEY     | participations_team_id_fkey                          | teams                       | id                 |
| participations              | house_id             | uuid                     | FOREIGN KEY     | participations_house_id_fkey                         | houses                      | id                 |
| participations              | hizb_id              | uuid                     | FOREIGN KEY     | participations_hizb_id_fkey                          | hizb                        | id                 |
| participations              | status               | USER-DEFINED             | null            | null                                                 | null                        | null               |
| participations              | is_wildcard          | boolean                  | null            | null                                                 | null                        | null               |
| participations              | registered_at        | timestamp with time zone | null            | null                                                 | null                        | null               |
| point_transactions          | id                   | uuid                     | PRIMARY KEY     | point_transactions_pkey                              | point_transactions          | id                 |
| point_transactions          | season_id            | uuid                     | FOREIGN KEY     | point_transactions_season_id_fkey                    | seasons                     | id                 |
| point_transactions          | house_id             | uuid                     | FOREIGN KEY     | point_transactions_house_id_fkey                     | houses                      | id                 |
| point_transactions          | student_tr           | bigint                   | FOREIGN KEY     | point_transactions_student_tr_fkey                   | profiles                    | tr_number          |
| point_transactions          | event_id             | uuid                     | FOREIGN KEY     | point_transactions_event_id_fkey                     | events                      | id                 |
| point_transactions          | source               | USER-DEFINED             | null            | null                                                 | null                        | null               |
| point_transactions          | points               | integer                  | null            | null                                                 | null                        | null               |
| point_transactions          | description          | text                     | null            | null                                                 | null                        | null               |
| point_transactions          | created_at           | timestamp with time zone | null            | null                                                 | null                        | null               |
| profiles                    | tr_number            | bigint                   | PRIMARY KEY     | profiles_pkey                                        | profiles                    | tr_number          |
| profiles                    | user_id              | uuid                     | UNIQUE          | profiles_user_id_key                                 | profiles                    | user_id            |
| profiles                    | user_id              | uuid                     | FOREIGN KEY     | profiles_user_id_fkey                                | null                        | null               |
| profiles                    | edu_email            | text                     | UNIQUE          | profiles_edu_email_key                               | profiles                    | edu_email          |
| profiles                    | full_name            | text                     | null            | null                                                 | null                        | null               |
| profiles                    | birth_date           | date                     | null            | null                                                 | null                        | null               |
| profiles                    | age_category         | text                     | null            | null                                                 | null                        | null               |
| profiles                    | house_id             | uuid                     | FOREIGN KEY     | profiles_house_id_fkey                               | houses                      | id                 |
| profiles                    | hizb_id              | uuid                     | FOREIGN KEY     | profiles_hizb_id_fkey                                | hizb                        | id                 |
| profiles                    | avatar_url           | text                     | null            | null                                                 | null                        | null               |
| profiles                    | created_at           | timestamp with time zone | null            | null                                                 | null                        | null               |
| profiles                    | updated_at           | timestamp with time zone | null            | null                                                 | null                        | null               |
| profiles                    | its_number           | integer                  | UNIQUE          | profiles_its_number_key                              | profiles                    | its_number         |
| profiles                    | darajah              | smallint                 | null            | null                                                 | null                        | null               |
| profiles                    | class_name           | text                     | null            | null                                                 | null                        | null               |
| profiles                    | is_under_18          | boolean                  | null            | null                                                 | null                        | null               |
| seasons                     | id                   | uuid                     | PRIMARY KEY     | seasons_pkey                                         | seasons                     | id                 |
| seasons                     | name                 | text                     | null            | null                                                 | null                        | null               |
| seasons                     | start_date           | date                     | null            | null                                                 | null                        | null               |
| seasons                     | end_date             | date                     | null            | null                                                 | null                        | null               |
| seasons                     | is_active            | boolean                  | null            | null                                                 | null                        | null               |
| seasons                     | created_at           | timestamp with time zone | null            | null                                                 | null                        | null               |
| sport_self_assessments      | id                   | uuid                     | PRIMARY KEY     | sport_self_assessments_pkey                          | sport_self_assessments      | id                 |
| sport_self_assessments      | student_id           | uuid                     | UNIQUE          | sport_self_assessments_student_id_sport_id_key       | sport_self_assessments      | sport_id           |
| sport_self_assessments      | student_id           | uuid                     | UNIQUE          | sport_self_assessments_student_id_sport_id_key       | sport_self_assessments      | student_id         |
| sport_self_assessments      | sport_id             | uuid                     | FOREIGN KEY     | sport_self_assessments_sport_id_fkey                 | sports                      | id                 |
| sport_self_assessments      | sport_id             | uuid                     | UNIQUE          | sport_self_assessments_student_id_sport_id_key       | sport_self_assessments      | sport_id           |
| sport_self_assessments      | sport_id             | uuid                     | UNIQUE          | sport_self_assessments_student_id_sport_id_key       | sport_self_assessments      | student_id         |
| sport_self_assessments      | experience_level     | text                     | null            | null                                                 | null                        | null               |
| sport_self_assessments      | skill_rating         | integer                  | null            | null                                                 | null                        | null               |
| sport_self_assessments      | years_of_practice    | integer                  | null            | null                                                 | null                        | null               |
| sport_self_assessments      | created_at           | timestamp with time zone | null            | null                                                 | null                        | null               |
| sports                      | id                   | uuid                     | PRIMARY KEY     | sports_pkey                                          | sports                      | id                 |
| sports                      | name                 | text                     | null            | null                                                 | null                        | null               |
| sports                      | sport_type           | USER-DEFINED             | null            | null                                                 | null                        | null               |
| sports                      | created_at           | timestamp with time zone | null            | null                                                 | null                        | null               |
| sports                      | category             | text                     | null            | null                                                 | null                        | null               |
| sports_interests            | id                   | uuid                     | PRIMARY KEY     | sports_interests_pkey                                | sports_interests            | id                 |
| sports_interests            | student_id           | uuid                     | UNIQUE          | sports_interests_student_id_sport_id_key             | sports_interests            | student_id         |
| sports_interests            | student_id           | uuid                     | UNIQUE          | sports_interests_student_id_sport_id_key             | sports_interests            | sport_id           |
| sports_interests            | sport_id             | uuid                     | UNIQUE          | sports_interests_student_id_sport_id_key             | sports_interests            | sport_id           |
| sports_interests            | sport_id             | uuid                     | UNIQUE          | sports_interests_student_id_sport_id_key             | sports_interests            | student_id         |
| sports_interests            | sport_id             | uuid                     | FOREIGN KEY     | sports_interests_sport_id_fkey                       | sports                      | id                 |
| sports_interests            | interest_level       | USER-DEFINED             | null            | null                                                 | null                        | null               |
| sports_interests            | confidence_level     | USER-DEFINED             | null            | null                                                 | null                        | null               |
| sports_interests            | created_by           | USER-DEFINED             | null            | null                                                 | null                        | null               |
| sports_interests            | notes                | text                     | null            | null                                                 | null                        | null               |
| sports_interests            | created_at           | timestamp with time zone | null            | null                                                 | null                        | null               |
| sports_interests            | updated_at           | timestamp with time zone | null            | null                                                 | null                        | null               |
| sports_interests            | is_identified_talent | boolean                  | null            | null                                                 | null                        | null               |
| student_event_roles         | id                   | uuid                     | PRIMARY KEY     | student_event_roles_pkey                             | student_event_roles         | id                 |
| student_event_roles         | student_tr           | bigint                   | UNIQUE          | student_event_roles_student_tr_event_id_role_key     | student_event_roles         | event_id           |
| student_event_roles         | student_tr           | bigint                   | UNIQUE          | student_event_roles_student_tr_event_id_role_key     | student_event_roles         | role               |
| student_event_roles         | student_tr           | bigint                   | UNIQUE          | student_event_roles_student_tr_event_id_role_key     | student_event_roles         | student_tr         |
| student_event_roles         | student_tr           | bigint                   | FOREIGN KEY     | student_event_roles_student_tr_fkey                  | profiles                    | tr_number          |
| student_event_roles         | event_id             | uuid                     | UNIQUE          | student_event_roles_student_tr_event_id_role_key     | student_event_roles         | role               |
| student_event_roles         | event_id             | uuid                     | FOREIGN KEY     | student_event_roles_event_id_fkey                    | events                      | id                 |
| student_event_roles         | event_id             | uuid                     | UNIQUE          | student_event_roles_student_tr_event_id_role_key     | student_event_roles         | event_id           |
| student_event_roles         | event_id             | uuid                     | UNIQUE          | student_event_roles_student_tr_event_id_role_key     | student_event_roles         | student_tr         |
| student_event_roles         | season_id            | uuid                     | FOREIGN KEY     | student_event_roles_season_id_fkey                   | seasons                     | id                 |
| student_event_roles         | role                 | USER-DEFINED             | UNIQUE          | student_event_roles_student_tr_event_id_role_key     | student_event_roles         | student_tr         |
| student_event_roles         | role                 | USER-DEFINED             | UNIQUE          | student_event_roles_student_tr_event_id_role_key     | student_event_roles         | role               |
| student_event_roles         | role                 | USER-DEFINED             | UNIQUE          | student_event_roles_student_tr_event_id_role_key     | student_event_roles         | event_id           |
| student_rankings_view       | season_id            | uuid                     | null            | null                                                 | null                        | null               |
| student_rankings_view       | student_tr           | bigint                   | null            | null                                                 | null                        | null               |
| student_rankings_view       | student_name         | text                     | null            | null                                                 | null                        | null               |
| student_rankings_view       | house_id             | uuid                     | null            | null                                                 | null                        | null               |
| student_rankings_view       | house_name           | text                     | null            | null                                                 | null                        | null               |
| student_rankings_view       | user_id              | uuid                     | null            | null                                                 | null                        | null               |
| student_rankings_view       | total_points         | integer                  | null            | null                                                 | null                        | null               |
| student_rankings_view       | placements           | integer                  | null            | null                                                 | null                        | null               |
| student_rankings_view       | participations       | integer                  | null            | null                                                 | null                        | null               |
| student_selections          | id                   | uuid                     | PRIMARY KEY     | student_selections_pkey                              | student_selections          | id                 |
| student_selections          | season_id            | uuid                     | UNIQUE          | uq_selection_slot                                    | student_selections          | rank               |
| student_selections          | season_id            | uuid                     | UNIQUE          | uq_selection_slot                                    | student_selections          | season_id          |
| student_selections          | season_id            | uuid                     | UNIQUE          | uq_selection_slot                                    | student_selections          | sport_id           |
| student_selections          | season_id            | uuid                     | UNIQUE          | uq_selection_slot                                    | student_selections          | house_id           |
| student_selections          | season_id            | uuid                     | FOREIGN KEY     | student_selections_season_id_fkey                    | seasons                     | id                 |
| student_selections          | season_id            | uuid                     | UNIQUE          | uq_selection_slot                                    | student_selections          | category           |
| student_selections          | house_id             | uuid                     | FOREIGN KEY     | student_selections_house_id_fkey                     | houses                      | id                 |
| student_selections          | house_id             | uuid                     | UNIQUE          | uq_selection_slot                                    | student_selections          | category           |
| student_selections          | house_id             | uuid                     | UNIQUE          | uq_selection_slot                                    | student_selections          | house_id           |
| student_selections          | house_id             | uuid                     | UNIQUE          | uq_selection_slot                                    | student_selections          | rank               |
| student_selections          | house_id             | uuid                     | UNIQUE          | uq_selection_slot                                    | student_selections          | season_id          |
| student_selections          | house_id             | uuid                     | UNIQUE          | uq_selection_slot                                    | student_selections          | sport_id           |
| student_selections          | sport_id             | uuid                     | UNIQUE          | uq_selection_slot                                    | student_selections          | sport_id           |
| student_selections          | sport_id             | uuid                     | UNIQUE          | uq_selection_slot                                    | student_selections          | category           |
| student_selections          | sport_id             | uuid                     | UNIQUE          | uq_selection_slot                                    | student_selections          | rank               |
| student_selections          | sport_id             | uuid                     | UNIQUE          | uq_selection_slot                                    | student_selections          | house_id           |
| student_selections          | sport_id             | uuid                     | FOREIGN KEY     | student_selections_sport_id_fkey                     | sports                      | id                 |
| student_selections          | sport_id             | uuid                     | UNIQUE          | uq_selection_slot                                    | student_selections          | season_id          |
| student_selections          | category             | text                     | UNIQUE          | uq_selection_slot                                    | student_selections          | rank               |
| student_selections          | category             | text                     | UNIQUE          | uq_selection_slot                                    | student_selections          | season_id          |
| student_selections          | category             | text                     | UNIQUE          | uq_selection_slot                                    | student_selections          | sport_id           |
| student_selections          | category             | text                     | UNIQUE          | uq_selection_slot                                    | student_selections          | category           |
| student_selections          | category             | text                     | UNIQUE          | uq_selection_slot                                    | student_selections          | house_id           |
| student_selections          | rank                 | integer                  | UNIQUE          | uq_selection_slot                                    | student_selections          | category           |
| student_selections          | rank                 | integer                  | UNIQUE          | uq_selection_slot                                    | student_selections          | house_id           |
| student_selections          | rank                 | integer                  | UNIQUE          | uq_selection_slot                                    | student_selections          | rank               |
| student_selections          | rank                 | integer                  | UNIQUE          | uq_selection_slot                                    | student_selections          | season_id          |
| student_selections          | rank                 | integer                  | UNIQUE          | uq_selection_slot                                    | student_selections          | sport_id           |
| student_selections          | student_tr           | bigint                   | FOREIGN KEY     | student_selections_student_tr_fkey                   | profiles                    | tr_number          |
| student_selections          | eligibility          | text                     | null            | null                                                 | null                        | null               |
| student_selections          | created_by           | uuid                     | null            | null                                                 | null                        | null               |
| student_selections          | created_at           | timestamp with time zone | null            | null                                                 | null                        | null               |
| student_selections          | is_final             | boolean                  | null            | null                                                 | null                        | null               |
| student_selections          | is_locked            | boolean                  | null            | null                                                 | null                        | null               |
| student_sport_proficiencies | id                   | uuid                     | PRIMARY KEY     | student_sport_proficiencies_pkey                     | student_sport_proficiencies | id                 |
| student_sport_proficiencies | sport_id             | uuid                     | FOREIGN KEY     | student_sport_proficiencies_sport_id_fkey            | sports                      | id                 |
| student_sport_proficiencies | level                | USER-DEFINED             | null            | null                                                 | null                        | null               |
| student_sport_proficiencies | source               | text                     | null            | null                                                 | null                        | null               |
| student_sport_proficiencies | updated_at           | timestamp with time zone | null            | null                                                 | null                        | null               |
| student_sport_proficiencies | created_at           | timestamp with time zone | null            | null                                                 | null                        | null               |
| student_sport_proficiencies | student_tr           | bigint                   | FOREIGN KEY     | student_sport_proficiencies_student_tr_fkey          | profiles                    | tr_number          |
| student_sport_scores        | id                   | uuid                     | PRIMARY KEY     | student_sport_scores_pkey                            | student_sport_scores        | id                 |
| student_sport_scores        | student_id           | uuid                     | UNIQUE          | student_sport_scores_student_id_sport_id_key         | student_sport_scores        | sport_id           |
| student_sport_scores        | student_id           | uuid                     | UNIQUE          | student_sport_scores_student_id_sport_id_key         | student_sport_scores        | student_id         |
| student_sport_scores        | sport_id             | uuid                     | FOREIGN KEY     | fk_student_sport_scores_sport                        | sports                      | id                 |
| student_sport_scores        | sport_id             | uuid                     | UNIQUE          | student_sport_scores_student_id_sport_id_key         | student_sport_scores        | sport_id           |
| student_sport_scores        | sport_id             | uuid                     | UNIQUE          | student_sport_scores_student_id_sport_id_key         | student_sport_scores        | student_id         |
| student_sport_scores        | competition_score    | integer                  | null            | null                                                 | null                        | null               |
| student_sport_scores        | club_score           | integer                  | null            | null                                                 | null                        | null               |
| student_sport_scores        | activity_score       | integer                  | null            | null                                                 | null                        | null               |
| student_sport_scores        | fitness_score        | integer                  | null            | null                                                 | null                        | null               |
| student_sport_scores        | total_score          | integer                  | null            | null                                                 | null                        | null               |
| student_sport_scores        | proficiency_level    | USER-DEFINED             | null            | null                                                 | null                        | null               |
| student_sport_scores        | last_calculated      | timestamp with time zone | null            | null                                                 | null                        | null               |
| team_members                | id                   | uuid                     | PRIMARY KEY     | team_members_pkey                                    | team_members                | id                 |
| team_members                | team_id              | uuid                     | FOREIGN KEY     | team_members_team_id_fkey                            | teams                       | id                 |
| team_members                | team_id              | uuid                     | UNIQUE          | team_members_team_id_student_tr_key                  | team_members                | student_tr         |
| team_members                | team_id              | uuid                     | UNIQUE          | team_members_team_id_student_tr_key                  | team_members                | team_id            |
| team_members                | student_tr           | bigint                   | UNIQUE          | team_members_team_id_student_tr_key                  | team_members                | team_id            |
| team_members                | student_tr           | bigint                   | FOREIGN KEY     | team_members_student_tr_fkey                         | profiles                    | tr_number          |
| team_members                | student_tr           | bigint                   | UNIQUE          | team_members_team_id_student_tr_key                  | team_members                | student_tr         |
| team_members                | role                 | USER-DEFINED             | null            | null                                                 | null                        | null               |
| team_standings              | id                   | uuid                     | PRIMARY KEY     | team_standings_pkey                                  | team_standings              | id                 |
| team_standings              | season_id            | uuid                     | FOREIGN KEY     | team_standings_season_id_fkey                        | seasons                     | id                 |
| team_standings              | event_id             | uuid                     | FOREIGN KEY     | team_standings_event_id_fkey                         | events                      | id                 |
| team_standings              | team_id              | uuid                     | FOREIGN KEY     | team_standings_team_id_fkey                          | teams                       | id                 |
| team_standings              | played               | integer                  | null            | null                                                 | null                        | null               |
| team_standings              | won                  | integer                  | null            | null                                                 | null                        | null               |
| team_standings              | lost                 | integer                  | null            | null                                                 | null                        | null               |
| team_standings              | drawn                | integer                  | null            | null                                                 | null                        | null               |
| team_standings              | goal_diff            | numeric                  | null            | null                                                 | null                        | null               |
| team_standings              | net_run_rate         | numeric                  | null            | null                                                 | null                        | null               |
| team_standings              | points               | integer                  | null            | null                                                 | null                        | null               |
| team_standings              | goals_for            | numeric                  | null            | null                                                 | null                        | null               |
| team_standings              | goals_against        | numeric                  | null            | null                                                 | null                        | null               |
| teams                       | id                   | uuid                     | PRIMARY KEY     | teams_pkey                                           | teams                       | id                 |
| teams                       | name                 | text                     | null            | null                                                 | null                        | null               |
| teams                       | house_id             | uuid                     | FOREIGN KEY     | teams_house_id_fkey                                  | houses                      | id                 |
| teams                       | event_id             | uuid                     | FOREIGN KEY     | teams_event_id_fkey                                  | events                      | id                 |
| teams                       | age_group            | text                     | null            | null                                                 | null                        | null               |
| teams                       | created_at           | timestamp with time zone | null            | null                                                 | null                        | null               |
| temp_student_houses         | tr_number            | bigint                   | null            | null                                                 | null                        | null               |
| temp_student_houses         | hizb_id              | uuid                     | null            | null                                                 | null                        | null               |
| temp_student_houses         | house_id             | uuid                     | null            | null                                                 | null                        | null               |
| training_attendance         | id                   | uuid                     | PRIMARY KEY     | training_attendance_pkey                             | training_attendance         | id                 |
| training_attendance         | training_id          | uuid                     | UNIQUE          | training_attendance_training_id_student_tr_key       | training_attendance         | training_id        |
| training_attendance         | training_id          | uuid                     | FOREIGN KEY     | training_attendance_training_id_fkey                 | trainings                   | id                 |
| training_attendance         | training_id          | uuid                     | UNIQUE          | training_attendance_training_id_student_tr_key       | training_attendance         | student_tr         |
| training_attendance         | student_tr           | bigint                   | FOREIGN KEY     | training_attendance_student_tr_fkey                  | profiles                    | tr_number          |
| training_attendance         | student_tr           | bigint                   | UNIQUE          | training_attendance_training_id_student_tr_key       | training_attendance         | student_tr         |
| training_attendance         | student_tr           | bigint                   | UNIQUE          | training_attendance_training_id_student_tr_key       | training_attendance         | training_id        |
| training_attendance         | attended_at          | timestamp with time zone | null            | null                                                 | null                        | null               |
| trainings                   | id                   | uuid                     | PRIMARY KEY     | trainings_pkey                                       | trainings                   | id                 |
| trainings                   | name                 | text                     | null            | null                                                 | null                        | null               |
| trainings                   | event_id             | uuid                     | FOREIGN KEY     | trainings_event_id_fkey                              | events                      | id                 |
| trainings                   | season_id            | uuid                     | FOREIGN KEY     | trainings_season_id_fkey                             | seasons                     | id                 |
| trainings                   | created_at           | timestamp with time zone | null            | null                                                 | null                        | null               |
| user_roles                  | id                   | uuid                     | PRIMARY KEY     | user_roles_pkey                                      | user_roles                  | id                 |
| user_roles                  | user_id              | uuid                     | UNIQUE          | user_roles_user_id_role_key                          | user_roles                  | role               |
| user_roles                  | user_id              | uuid                     | FOREIGN KEY     | user_roles_user_id_fkey                              | null                        | null               |
| user_roles                  | user_id              | uuid                     | UNIQUE          | user_roles_user_id_role_key                          | user_roles                  | user_id            |
| user_roles                  | role                 | USER-DEFINED             | UNIQUE          | user_roles_user_id_role_key                          | user_roles                  | user_id            |
| user_roles                  | role                 | USER-DEFINED             | UNIQUE          | user_roles_user_id_role_key                          | user_roles                  | role               |
| wildcard_programs           | id                   | uuid                     | PRIMARY KEY     | wildcard_programs_pkey                               | wildcard_programs           | id                 |
| wildcard_programs           | event_id             | uuid                     | FOREIGN KEY     | wildcard_programs_event_id_fkey                      | events                      | id                 |
| wildcard_programs           | program_name         | text                     | null            | null                                                 | null                        | null               |
| wildcard_programs           | quota_per_house      | integer                  | null            | null                                                 | null                        | null               |
| wildcard_programs           | created_at           | timestamp with time zone | null            | null                                                 | null                        | null               |


# foreign keys

| table_name                  | column_name     | foreign_table  | foreign_column |
| --------------------------- | --------------- | -------------- | -------------- |
| sports_interests            | student_tr      | profiles       | tr_number      |
| certifications              | student_tr      | profiles       | tr_number      |
| student_event_roles         | event_id        | events         | id             |
| student_event_roles         | season_id       | seasons        | id             |
| point_transactions          | season_id       | seasons        | id             |
| point_transactions          | house_id        | houses         | id             |
| point_transactions          | event_id        | events         | id             |
| training_attendance         | training_id     | trainings      | id             |
| match_requests              | created_by      | profiles       | tr_number      |
| clubs                       | incharge_id     | profiles       | tr_number      |
| clubs                       | sub_incharge_id | profiles       | tr_number      |
| clubs                       | created_by      | profiles       | tr_number      |
| fitness_logs                | student_tr      | profiles       | tr_number      |
| achievements                | student_tr      | profiles       | tr_number      |
| participations              | student_tr      | profiles       | tr_number      |
| team_members                | student_tr      | profiles       | tr_number      |
| student_event_roles         | student_tr      | profiles       | tr_number      |
| point_transactions          | student_tr      | profiles       | tr_number      |
| training_attendance         | student_tr      | profiles       | tr_number      |
| student_selections          | student_tr      | profiles       | tr_number      |
| student_sport_proficiencies | student_tr      | profiles       | tr_number      |
| sport_self_assessments      | student_tr      | profiles       | tr_number      |
| certifications              | issued_by       | profiles       | tr_number      |
| student_sport_scores        | student_tr      | profiles       | tr_number      |
| profiles                    | house_id        | houses         | id             |
| profiles                    | hizb_id         | hizb           | id             |
| hizb                        | house_id        | houses         | id             |
| events                      | sport_id        | sports         | id             |
| events                      | season_id       | seasons        | id             |
| wildcard_programs           | event_id        | events         | id             |
| teams                       | house_id        | houses         | id             |
| teams                       | event_id        | events         | id             |
| matches                     | season_id       | seasons        | id             |
| matches                     | event_id        | events         | id             |
| matches                     | home_team_id    | teams          | id             |
| matches                     | away_team_id    | teams          | id             |
| matches                     | winner_team_id  | teams          | id             |
| team_standings              | season_id       | seasons        | id             |
| team_standings              | event_id        | events         | id             |
| team_standings              | team_id         | teams          | id             |
| trainings                   | event_id        | events         | id             |
| trainings                   | season_id       | seasons        | id             |
| student_sport_proficiencies | sport_id        | sports         | id             |
| sport_self_assessments      | sport_id        | sports         | id             |
| student_selections          | season_id       | seasons        | id             |
| student_selections          | house_id        | houses         | id             |
| student_selections          | sport_id        | sports         | id             |
| sports_interests            | sport_id        | sports         | id             |
| clubs                       | sport_id        | sports         | id             |
| club_members                | club_id         | clubs          | id             |
| club_events                 | club_id         | clubs          | id             |
| club_event_participants     | club_event_id   | club_events    | id             |
| match_requests              | sport_id        | sports         | id             |
| match_request_players       | request_id      | match_requests | id             |
| student_sport_scores        | sport_id        | sports         | id             |
| certifications              | sport_id        | sports         | id             |
| team_members                | team_id         | teams          | id             |
| participations              | season_id       | seasons        | id             |
| participations              | event_id        | events         | id             |
| participations              | team_id         | teams          | id             |
| participations              | house_id        | houses         | id             |
| participations              | hizb_id         | hizb           | id             |