# SportSync Master Schema & Security Reference
**Last Updated**: March 14, 2026
**Master Identity Strategy**: `profiles.tr_number` (BIGINT) is the anchor for all student-related data.

---

## 1. Core Identity & Access Control
*These tables manage who the users are and what they can do.*

### **Table: `profiles` (MASTER)**
| Column | Type | Nullable | PK | References | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **tr_number** | bigint | NO | **YES** | - | Master Student ID |
| user_id | uuid | YES | NO | auth.users | Link to Login session |
| edu_email | text | YES | NO | - | Unique university email |
| full_name | text | YES | NO | - | Display Name |
| house_id | uuid | YES | NO | houses(id) | |
| hizb_id | uuid | YES | NO | hizb(id) | |
| its_number | integer | YES | NO | - | Community ID |
| darajah | smallint | YES | NO | - | Grade level |
| class_name | text | YES | NO | - | Section name |
| is_under_18 | boolean | YES | NO | - | For U-18 categories |

### **Table: `user_roles`**
| Column | Type | Nullable | PK | References |
| :--- | :--- | :--- | :--- | :--- |
| student_tr | bigint | NO | NO | profiles(tr_number) |
| role | enum | NO | NO | (app_role) |

---

## 2. Competition & Selection Engine
*The logic for drafting students and finalizing tournament entries.*

### **Table: `student_selections` (Drafting)**
| Column | Type | Nullable | References | Notes |
| :--- | :--- | :--- | :--- | :--- |
| **student_tr** | bigint | NO | profiles(tr_number) | The selected student |
| season_id | uuid | NO | seasons(id) | |
| house_id | uuid | NO | houses(id) | |
| sport_id | uuid | NO | sports(id) | |
| rank | integer | NO | - | Priority (1, 2, 3...) |
| created_by | bigint | YES | profiles(tr_number) | Captain who drafted |
| is_locked | boolean | NO | - | Locked by Admin |
| is_final | boolean | NO | - | Submitted by Captain |

### **Table: `participations` (Official Entry)**
| Column | Type | Nullable | References |
| :--- | :--- | :--- | :--- |
| **student_tr** | bigint | YES | profiles(tr_number) |
| status | enum | YES | (participation_status) |
| registered_at| timestamptz | YES | - |

---

## 3. Teams, Matches & Standings
*Structure for tournament gameplay and ranking.*

### **Table: `teams` & `team_members`**
| Table | Column | Type | References |
| :--- | :--- | :--- | :--- |
| teams | event_id | uuid | events(id) |
| team_members | student_tr | bigint | profiles(tr_number) |

### **Table: `matches` & `team_standings`**
| Table | Column | Type | Notes |
| :--- | :--- | :--- | :--- |
| matches | stage | enum | 'group', 'quarterfinal', etc. |
| team_standings| points | integer | Summed from match results |

---

## 4. Talent, Proficiency & Scoring
*Performance tracking and student assessments.*

### **Table: `student_sport_scores`**
| Column | Type | Nullable | References | Notes |
| :--- | :--- | :--- | :--- | :--- |
| **student_tr** | bigint | YES | profiles(tr_number) | Primary score link |
| total_score | integer | NO | - | Computed 0-100 |
| proficiency_level| enum | NO | - | beginner...master |

### **Domain Tables (TR-Linked)**
- **`sports_interests`**: Links `student_tr` to `sport_id`.
- **`sport_self_assessments`**: Links `student_tr` to `sport_id`.
- **`fitness_logs`**: Links `student_tr` to performance metrics.
- **`certifications`**: Links `student_tr` to `issued_by` (tr_number).

---

## 🛡️ Security: RLS Master List
| Table | Policy Name | Operation | Logic Overview |
| :--- | :--- | :--- | :--- |
| **student_selections** | Admins manage all | ALL | `has_role(auth.uid(), 'admin')` |
| **student_selections** | Captains manage own | ALL | `house_id` match via profile |
| **profiles** | Users update own | UPDATE | `auth.uid() = user_id` |
| **user_roles** | Users read own | SELECT | `student_tr` lookup via profile |

---

## RLS Policies

| schemaname | tablename                   | policyname                                | permissive | roles           | operation | using_expression                                                                                                                                                                                     | check_expression                                                                                                                                                                                     |
| ---------- | --------------------------- | ----------------------------------------- | ---------- | --------------- | --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| public     | certifications              | Admins manage certifications              | PERMISSIVE | {authenticated} | ALL       | has_role(auth.uid(), 'admin'::app_role)                                                                                                                                                              | has_role(auth.uid(), 'admin'::app_role)                                                                                                                                                              |
| public     | certifications              | Anyone can read issued certifications     | PERMISSIVE | {authenticated} | SELECT    | (status = 'issued'::certification_status)                                                                                                                                                            | null                                                                                                                                                                                                 |
| public     | certifications              | Students read own certifications          | PERMISSIVE | {authenticated} | SELECT    | (student_tr IN ( SELECT profiles.tr_number
   FROM profiles
  WHERE (profiles.user_id = auth.uid())))                                                                                                | null                                                                                                                                                                                                 |
| public     | club_event_participants     | Admins manage club_event_participants     | PERMISSIVE | {authenticated} | ALL       | has_role(auth.uid(), 'admin'::app_role)                                                                                                                                                              | has_role(auth.uid(), 'admin'::app_role)                                                                                                                                                              |
| public     | club_event_participants     | Anyone can read club_event_participants   | PERMISSIVE | {authenticated} | SELECT    | true                                                                                                                                                                                                 | null                                                                                                                                                                                                 |
| public     | club_event_participants     | Coaches manage club_event_participants    | PERMISSIVE | {authenticated} | ALL       | has_role(auth.uid(), 'coach'::app_role)                                                                                                                                                              | has_role(auth.uid(), 'coach'::app_role)                                                                                                                                                              |
| public     | club_events                 | Admins manage club_events                 | PERMISSIVE | {authenticated} | ALL       | has_role(auth.uid(), 'admin'::app_role)                                                                                                                                                              | has_role(auth.uid(), 'admin'::app_role)                                                                                                                                                              |
| public     | club_events                 | Anyone can read club_events               | PERMISSIVE | {authenticated} | SELECT    | true                                                                                                                                                                                                 | null                                                                                                                                                                                                 |
| public     | club_events                 | Coaches manage club_events                | PERMISSIVE | {authenticated} | ALL       | has_role(auth.uid(), 'coach'::app_role)                                                                                                                                                              | has_role(auth.uid(), 'coach'::app_role)                                                                                                                                                              |
| public     | club_members                | Admins manage club_members                | PERMISSIVE | {authenticated} | ALL       | has_role(auth.uid(), 'admin'::app_role)                                                                                                                                                              | has_role(auth.uid(), 'admin'::app_role)                                                                                                                                                              |
| public     | club_members                | Anyone can read club_members              | PERMISSIVE | {authenticated} | SELECT    | true                                                                                                                                                                                                 | null                                                                                                                                                                                                 |
| public     | club_members                | Coaches manage club_members               | PERMISSIVE | {authenticated} | ALL       | has_role(auth.uid(), 'coach'::app_role)                                                                                                                                                              | has_role(auth.uid(), 'coach'::app_role)                                                                                                                                                              |
| public     | club_members                | Students join clubs                       | PERMISSIVE | {authenticated} | INSERT    | null                                                                                                                                                                                                 | (student_tr IN ( SELECT profiles.tr_number
   FROM profiles
  WHERE (profiles.user_id = auth.uid())))                                                                                                |
| public     | club_members                | Students leave clubs                      | PERMISSIVE | {authenticated} | DELETE    | (student_tr IN ( SELECT profiles.tr_number
   FROM profiles
  WHERE (profiles.user_id = auth.uid())))                                                                                                | null                                                                                                                                                                                                 |
| public     | club_members                | Students read own club memberships        | PERMISSIVE | {authenticated} | SELECT    | (student_tr IN ( SELECT profiles.tr_number
   FROM profiles
  WHERE (profiles.user_id = auth.uid())))                                                                                                | null                                                                                                                                                                                                 |
| public     | club_members                | Students read own clubs                   | PERMISSIVE | {authenticated} | SELECT    | (student_tr IN ( SELECT profiles.tr_number
   FROM profiles
  WHERE (profiles.user_id = auth.uid())))                                                                                                | null                                                                                                                                                                                                 |
| public     | clubs                       | Admins manage clubs                       | PERMISSIVE | {authenticated} | ALL       | has_role(auth.uid(), 'admin'::app_role)                                                                                                                                                              | has_role(auth.uid(), 'admin'::app_role)                                                                                                                                                              |
| public     | clubs                       | Anyone can read clubs                     | PERMISSIVE | {authenticated} | SELECT    | true                                                                                                                                                                                                 | null                                                                                                                                                                                                 |
| public     | clubs                       | Coaches manage clubs                      | PERMISSIVE | {authenticated} | ALL       | has_role(auth.uid(), 'coach'::app_role)                                                                                                                                                              | has_role(auth.uid(), 'coach'::app_role)                                                                                                                                                              |
| public     | events                      | Admins manage events                      | PERMISSIVE | {authenticated} | ALL       | has_role(auth.uid(), 'admin'::app_role)                                                                                                                                                              | has_role(auth.uid(), 'admin'::app_role)                                                                                                                                                              |
| public     | events                      | Anyone can read events                    | PERMISSIVE | {authenticated} | SELECT    | true                                                                                                                                                                                                 | null                                                                                                                                                                                                 |
| public     | events                      | Coaches manage events                     | PERMISSIVE | {authenticated} | ALL       | has_role(auth.uid(), 'coach'::app_role)                                                                                                                                                              | has_role(auth.uid(), 'coach'::app_role)                                                                                                                                                              |
| public     | fitness_logs                | Users insert own fitness                  | PERMISSIVE | {authenticated} | INSERT    | null                                                                                                                                                                                                 | (student_tr IN ( SELECT profiles.tr_number
   FROM profiles
  WHERE (profiles.user_id = auth.uid())))                                                                                                |
| public     | fitness_logs                | Users read own fitness                    | PERMISSIVE | {authenticated} | SELECT    | (student_tr IN ( SELECT profiles.tr_number
   FROM profiles
  WHERE (profiles.user_id = auth.uid())))                                                                                                | null                                                                                                                                                                                                 |
| public     | hizb                        | Admins manage hizb                        | PERMISSIVE | {authenticated} | ALL       | has_role(auth.uid(), 'admin'::app_role)                                                                                                                                                              | has_role(auth.uid(), 'admin'::app_role)                                                                                                                                                              |
| public     | hizb                        | Anyone can read hizb                      | PERMISSIVE | {authenticated} | SELECT    | true                                                                                                                                                                                                 | null                                                                                                                                                                                                 |
| public     | houses                      | Admins manage houses                      | PERMISSIVE | {authenticated} | ALL       | has_role(auth.uid(), 'admin'::app_role)                                                                                                                                                              | has_role(auth.uid(), 'admin'::app_role)                                                                                                                                                              |
| public     | houses                      | Anyone can read houses                    | PERMISSIVE | {authenticated} | SELECT    | true                                                                                                                                                                                                 | null                                                                                                                                                                                                 |
| public     | match_request_players       | Admins manage match_request_players       | PERMISSIVE | {authenticated} | ALL       | has_role(auth.uid(), 'admin'::app_role)                                                                                                                                                              | has_role(auth.uid(), 'admin'::app_role)                                                                                                                                                              |
| public     | match_request_players       | Authenticated read match_request_players  | PERMISSIVE | {authenticated} | SELECT    | true                                                                                                                                                                                                 | null                                                                                                                                                                                                 |
| public     | match_request_players       | Students join match_requests              | PERMISSIVE | {authenticated} | INSERT    | null                                                                                                                                                                                                 | (student_tr IN ( SELECT profiles.tr_number
   FROM profiles
  WHERE (profiles.user_id = auth.uid())))                                                                                                |
| public     | match_request_players       | Students leave match_requests             | PERMISSIVE | {authenticated} | DELETE    | (student_tr IN ( SELECT profiles.tr_number
   FROM profiles
  WHERE (profiles.user_id = auth.uid())))                                                                                                | null                                                                                                                                                                                                 |
| public     | match_requests              | Admins manage match_requests              | PERMISSIVE | {authenticated} | ALL       | has_role(auth.uid(), 'admin'::app_role)                                                                                                                                                              | has_role(auth.uid(), 'admin'::app_role)                                                                                                                                                              |
| public     | match_requests              | Authenticated read match_requests         | PERMISSIVE | {authenticated} | SELECT    | true                                                                                                                                                                                                 | null                                                                                                                                                                                                 |
| public     | match_requests              | Creators delete own match_requests        | PERMISSIVE | {authenticated} | DELETE    | (created_by IN ( SELECT profiles.tr_number
   FROM profiles
  WHERE (profiles.user_id = auth.uid())))                                                                                                | null                                                                                                                                                                                                 |
| public     | match_requests              | Creators update own match_requests        | PERMISSIVE | {authenticated} | UPDATE    | (created_by IN ( SELECT profiles.tr_number
   FROM profiles
  WHERE (profiles.user_id = auth.uid())))                                                                                                | null                                                                                                                                                                                                 |
| public     | match_requests              | Students create match_requests            | PERMISSIVE | {authenticated} | INSERT    | null                                                                                                                                                                                                 | (created_by IN ( SELECT profiles.tr_number
   FROM profiles
  WHERE (profiles.user_id = auth.uid())))                                                                                                |
| public     | matches                     | Admins manage matches                     | PERMISSIVE | {authenticated} | ALL       | has_role(auth.uid(), 'admin'::app_role)                                                                                                                                                              | has_role(auth.uid(), 'admin'::app_role)                                                                                                                                                              |
| public     | matches                     | Anyone can read matches                   | PERMISSIVE | {authenticated} | SELECT    | true                                                                                                                                                                                                 | null                                                                                                                                                                                                 |
| public     | matches                     | Coaches manage matches                    | PERMISSIVE | {authenticated} | ALL       | has_role(auth.uid(), 'coach'::app_role)                                                                                                                                                              | has_role(auth.uid(), 'coach'::app_role)                                                                                                                                                              |
| public     | participations              | Students register self                    | PERMISSIVE | {authenticated} | INSERT    | null                                                                                                                                                                                                 | (student_tr IN ( SELECT profiles.tr_number
   FROM profiles
  WHERE (profiles.user_id = auth.uid())))                                                                                                |
| public     | profiles                    | Public profiles are viewable by everyone  | PERMISSIVE | {public}        | SELECT    | true                                                                                                                                                                                                 | null                                                                                                                                                                                                 |
| public     | profiles                    | Users can update own profile              | PERMISSIVE | {public}        | UPDATE    | (auth.uid() = user_id)                                                                                                                                                                               | null                                                                                                                                                                                                 |
| public     | seasons                     | Admins manage seasons                     | PERMISSIVE | {authenticated} | ALL       | has_role(auth.uid(), 'admin'::app_role)                                                                                                                                                              | has_role(auth.uid(), 'admin'::app_role)                                                                                                                                                              |
| public     | seasons                     | Anyone can read seasons                   | PERMISSIVE | {authenticated} | SELECT    | true                                                                                                                                                                                                 | null                                                                                                                                                                                                 |
| public     | sport_self_assessments      | Admins manage assessments                 | PERMISSIVE | {authenticated} | ALL       | has_role(auth.uid(), 'admin'::app_role)                                                                                                                                                              | has_role(auth.uid(), 'admin'::app_role)                                                                                                                                                              |
| public     | sport_self_assessments      | Authenticated users read assessments      | PERMISSIVE | {authenticated} | SELECT    | (auth.uid() IS NOT NULL)                                                                                                                                                                             | null                                                                                                                                                                                                 |
| public     | sport_self_assessments      | Students insert own assessment            | PERMISSIVE | {authenticated} | INSERT    | null                                                                                                                                                                                                 | (student_tr IN ( SELECT profiles.tr_number
   FROM profiles
  WHERE (profiles.user_id = auth.uid())))                                                                                                |
| public     | sport_self_assessments      | Students read own assessment              | PERMISSIVE | {authenticated} | SELECT    | (student_tr IN ( SELECT profiles.tr_number
   FROM profiles
  WHERE (profiles.user_id = auth.uid())))                                                                                                | null                                                                                                                                                                                                 |
| public     | sport_self_assessments      | Students update own assessment            | PERMISSIVE | {authenticated} | UPDATE    | (student_tr IN ( SELECT profiles.tr_number
   FROM profiles
  WHERE (profiles.user_id = auth.uid())))                                                                                                | null                                                                                                                                                                                                 |
| public     | sports                      | Admins manage sports                      | PERMISSIVE | {authenticated} | ALL       | has_role(auth.uid(), 'admin'::app_role)                                                                                                                                                              | has_role(auth.uid(), 'admin'::app_role)                                                                                                                                                              |
| public     | sports                      | Anyone can read sports                    | PERMISSIVE | {authenticated} | SELECT    | true                                                                                                                                                                                                 | null                                                                                                                                                                                                 |
| public     | sports_interests            | Admins manage sports_interests            | PERMISSIVE | {authenticated} | ALL       | has_role(auth.uid(), 'admin'::app_role)                                                                                                                                                              | has_role(auth.uid(), 'admin'::app_role)                                                                                                                                                              |
| public     | sports_interests            | Coaches manage sports_interests           | PERMISSIVE | {authenticated} | ALL       | has_role(auth.uid(), 'coach'::app_role)                                                                                                                                                              | has_role(auth.uid(), 'coach'::app_role)                                                                                                                                                              |
| public     | sports_interests            | Students insert own interests             | PERMISSIVE | {authenticated} | INSERT    | null                                                                                                                                                                                                 | (student_tr IN ( SELECT profiles.tr_number
   FROM profiles
  WHERE (profiles.user_id = auth.uid())))                                                                                                |
| public     | sports_interests            | Students read own interests               | PERMISSIVE | {authenticated} | SELECT    | (student_tr IN ( SELECT profiles.tr_number
   FROM profiles
  WHERE (profiles.user_id = auth.uid())))                                                                                                | null                                                                                                                                                                                                 |
| public     | sports_interests            | Students update own interests             | PERMISSIVE | {authenticated} | UPDATE    | (student_tr IN ( SELECT profiles.tr_number
   FROM profiles
  WHERE (profiles.user_id = auth.uid())))                                                                                                | null                                                                                                                                                                                                 |
| public     | student_selections          | Admins manage all selections              | PERMISSIVE | {authenticated} | ALL       | has_role(auth.uid(), 'admin'::app_role)                                                                                                                                                              | has_role(auth.uid(), 'admin'::app_role)                                                                                                                                                              |
| public     | student_selections          | Anyone can read selections                | PERMISSIVE | {authenticated} | SELECT    | true                                                                                                                                                                                                 | null                                                                                                                                                                                                 |
| public     | student_selections          | Captains manage own house selections      | PERMISSIVE | {authenticated} | ALL       | ((has_role(auth.uid(), 'captain'::app_role) OR has_role(auth.uid(), 'co_captain'::app_role)) AND (house_id IN ( SELECT profiles.house_id
   FROM profiles
  WHERE (profiles.user_id = auth.uid())))) | ((has_role(auth.uid(), 'captain'::app_role) OR has_role(auth.uid(), 'co_captain'::app_role)) AND (house_id IN ( SELECT profiles.house_id
   FROM profiles
  WHERE (profiles.user_id = auth.uid())))) |
| public     | student_sport_proficiencies | Admins manage proficiencies               | PERMISSIVE | {authenticated} | ALL       | has_role(auth.uid(), 'admin'::app_role)                                                                                                                                                              | has_role(auth.uid(), 'admin'::app_role)                                                                                                                                                              |
| public     | student_sport_proficiencies | Anyone can read proficiencies             | PERMISSIVE | {authenticated} | SELECT    | true                                                                                                                                                                                                 | null                                                                                                                                                                                                 |
| public     | student_sport_proficiencies | Coaches manage proficiencies              | PERMISSIVE | {authenticated} | ALL       | has_role(auth.uid(), 'coach'::app_role)                                                                                                                                                              | has_role(auth.uid(), 'coach'::app_role)                                                                                                                                                              |
| public     | student_sport_proficiencies | Students insert own proficiency           | PERMISSIVE | {authenticated} | INSERT    | null                                                                                                                                                                                                 | (student_tr IN ( SELECT profiles.tr_number
   FROM profiles
  WHERE (profiles.user_id = auth.uid())))                                                                                                |
| public     | student_sport_proficiencies | Students update own proficiency           | PERMISSIVE | {authenticated} | UPDATE    | (student_tr IN ( SELECT profiles.tr_number
   FROM profiles
  WHERE (profiles.user_id = auth.uid())))                                                                                                | null                                                                                                                                                                                                 |
| public     | student_sport_scores        | Admins manage student_sport_scores        | PERMISSIVE | {authenticated} | ALL       | has_role(auth.uid(), 'admin'::app_role)                                                                                                                                                              | has_role(auth.uid(), 'admin'::app_role)                                                                                                                                                              |
| public     | student_sport_scores        | Anyone can read student_sport_scores      | PERMISSIVE | {authenticated} | SELECT    | true                                                                                                                                                                                                 | null                                                                                                                                                                                                 |
| public     | student_sport_scores        | Coaches manage student_sport_scores       | PERMISSIVE | {authenticated} | ALL       | has_role(auth.uid(), 'coach'::app_role)                                                                                                                                                              | has_role(auth.uid(), 'coach'::app_role)                                                                                                                                                              |
| public     | team_standings              | Admins manage team_standings              | PERMISSIVE | {authenticated} | ALL       | has_role(auth.uid(), 'admin'::app_role)                                                                                                                                                              | has_role(auth.uid(), 'admin'::app_role)                                                                                                                                                              |
| public     | team_standings              | Anyone can read team_standings            | PERMISSIVE | {authenticated} | SELECT    | true                                                                                                                                                                                                 | null                                                                                                                                                                                                 |
| public     | team_standings              | Coaches manage team_standings             | PERMISSIVE | {authenticated} | ALL       | has_role(auth.uid(), 'coach'::app_role)                                                                                                                                                              | has_role(auth.uid(), 'coach'::app_role)                                                                                                                                                              |
| public     | teams                       | Admins manage teams                       | PERMISSIVE | {authenticated} | ALL       | has_role(auth.uid(), 'admin'::app_role)                                                                                                                                                              | has_role(auth.uid(), 'admin'::app_role)                                                                                                                                                              |
| public     | teams                       | Anyone can read teams                     | PERMISSIVE | {authenticated} | SELECT    | true                                                                                                                                                                                                 | null                                                                                                                                                                                                 |
| public     | teams                       | Coaches manage teams                      | PERMISSIVE | {authenticated} | ALL       | has_role(auth.uid(), 'coach'::app_role)                                                                                                                                                              | has_role(auth.uid(), 'coach'::app_role)                                                                                                                                                              |
| public     | trainings                   | Admins manage trainings                   | PERMISSIVE | {authenticated} | ALL       | has_role(auth.uid(), 'admin'::app_role)                                                                                                                                                              | has_role(auth.uid(), 'admin'::app_role)                                                                                                                                                              |
| public     | trainings                   | Anyone can read trainings                 | PERMISSIVE | {authenticated} | SELECT    | true                                                                                                                                                                                                 | null                                                                                                                                                                                                 |
| public     | user_roles                  | Admins manage user_roles                  | PERMISSIVE | {authenticated} | ALL       | has_role(auth.uid(), 'admin'::app_role)                                                                                                                                                              | has_role(auth.uid(), 'admin'::app_role)                                                                                                                                                              |
| public     | user_roles                  | Roles are viewable by authenticated users | PERMISSIVE | {authenticated} | SELECT    | true                                                                                                                                                                                                 | null                                                                                                                                                                                                 |
| public     | user_roles                  | Users read own roles                      | PERMISSIVE | {authenticated} | SELECT    | (student_tr IN ( SELECT profiles.tr_number
   FROM profiles
  WHERE (profiles.user_id = auth.uid())))                                                                                                | null                                                                                                                                                                                                 |
| public     | wildcard_programs           | Admins manage wildcard_programs           | PERMISSIVE | {authenticated} | ALL       | has_role(auth.uid(), 'admin'::app_role)                                                                                                                                                              | has_role(auth.uid(), 'admin'::app_role)                                                                                                                                                              |
| public     | wildcard_programs           | Anyone can read wildcard_programs         | PERMISSIVE | {authenticated} | SELECT    | true                                                                                                                                                                                                 | null                                                                                                                                                                                                 |


## Overview : 

| table_name                  | column_name          | data_type                | is_nullable | column_default                              | is_primary_key | foreign_table  | foreign_column |
| --------------------------- | -------------------- | ------------------------ | ----------- | ------------------------------------------- | -------------- | -------------- | -------------- |
| achievements                | id                   | uuid                     | NO          | gen_random_uuid()                           | YES            | null           | null           |
| achievements                | student_tr           | bigint                   | NO          | null                                        | NO             | profiles       | tr_number      |
| achievements                | title                | text                     | NO          | null                                        | NO             | null           | null           |
| achievements                | description          | text                     | YES         | null                                        | NO             | null           | null           |
| achievements                | icon                 | text                     | YES         | null                                        | NO             | null           | null           |
| achievements                | earned_at            | timestamp with time zone | YES         | now()                                       | NO             | null           | null           |
| certifications              | id                   | uuid                     | NO          | gen_random_uuid()                           | YES            | null           | null           |
| certifications              | student_tr           | bigint                   | NO          | null                                        | NO             | profiles       | tr_number      |
| certifications              | sport_id             | uuid                     | NO          | null                                        | NO             | sports         | id             |
| certifications              | score_snapshot       | integer                  | NO          | 0                                           | NO             | null           | null           |
| certifications              | proficiency_level    | USER-DEFINED             | NO          | 'beginner'::proficiency_level               | NO             | null           | null           |
| certifications              | certificate_number   | text                     | NO          | null                                        | NO             | null           | null           |
| certifications              | issued_by            | bigint                   | YES         | null                                        | NO             | profiles       | tr_number      |
| certifications              | issued_at            | timestamp with time zone | YES         | now()                                       | NO             | null           | null           |
| certifications              | valid_year           | integer                  | NO          | null                                        | NO             | null           | null           |
| certifications              | notes                | text                     | YES         | null                                        | NO             | null           | null           |
| certifications              | status               | USER-DEFINED             | NO          | 'draft'::certification_status               | NO             | null           | null           |
| certifications              | created_at           | timestamp with time zone | NO          | now()                                       | NO             | null           | null           |
| club_event_participants     | id                   | uuid                     | NO          | gen_random_uuid()                           | YES            | null           | null           |
| club_event_participants     | club_event_id        | uuid                     | NO          | null                                        | NO             | club_events    | id             |
| club_event_participants     | status               | USER-DEFINED             | NO          | 'registered'::club_event_participant_status | NO             | null           | null           |
| club_event_participants     | joined_at            | timestamp with time zone | NO          | now()                                       | NO             | null           | null           |
| club_event_participants     | student_tr           | bigint                   | YES         | null                                        | NO             | profiles       | tr_number      |
| club_events                 | id                   | uuid                     | NO          | gen_random_uuid()                           | YES            | null           | null           |
| club_events                 | club_id              | uuid                     | NO          | null                                        | NO             | clubs          | id             |
| club_events                 | title                | text                     | NO          | null                                        | NO             | null           | null           |
| club_events                 | description          | text                     | YES         | null                                        | NO             | null           | null           |
| club_events                 | event_type           | USER-DEFINED             | NO          | 'practice'::club_event_type                 | NO             | null           | null           |
| club_events                 | event_date           | timestamp with time zone | YES         | null                                        | NO             | null           | null           |
| club_events                 | location             | text                     | YES         | null                                        | NO             | null           | null           |
| club_events                 | max_participants     | integer                  | YES         | null                                        | NO             | null           | null           |
| club_events                 | created_at           | timestamp with time zone | NO          | now()                                       | NO             | null           | null           |
| club_events                 | created_by           | bigint                   | YES         | null                                        | NO             | profiles       | tr_number      |
| club_members                | id                   | uuid                     | NO          | gen_random_uuid()                           | YES            | null           | null           |
| club_members                | club_id              | uuid                     | NO          | null                                        | NO             | clubs          | id             |
| club_members                | role                 | USER-DEFINED             | NO          | 'member'::club_member_role                  | NO             | null           | null           |
| club_members                | status               | USER-DEFINED             | NO          | 'active'::club_member_status                | NO             | null           | null           |
| club_members                | joined_at            | timestamp with time zone | NO          | now()                                       | NO             | null           | null           |
| club_members                | student_tr           | bigint                   | YES         | null                                        | NO             | profiles       | tr_number      |
| clubs                       | id                   | uuid                     | NO          | gen_random_uuid()                           | YES            | null           | null           |
| clubs                       | sport_id             | uuid                     | NO          | null                                        | NO             | sports         | id             |
| clubs                       | name                 | text                     | NO          | null                                        | NO             | null           | null           |
| clubs                       | description          | text                     | YES         | null                                        | NO             | null           | null           |
| clubs                       | incharge_id          | bigint                   | YES         | null                                        | NO             | profiles       | tr_number      |
| clubs                       | sub_incharge_id      | bigint                   | YES         | null                                        | NO             | profiles       | tr_number      |
| clubs                       | created_by           | bigint                   | YES         | null                                        | NO             | profiles       | tr_number      |
| clubs                       | is_active            | boolean                  | NO          | true                                        | NO             | null           | null           |
| clubs                       | created_at           | timestamp with time zone | NO          | now()                                       | NO             | null           | null           |
| events                      | id                   | uuid                     | NO          | gen_random_uuid()                           | YES            | null           | null           |
| events                      | sport_id             | uuid                     | NO          | null                                        | NO             | sports         | id             |
| events                      | season_id            | uuid                     | NO          | null                                        | NO             | seasons        | id             |
| events                      | name                 | text                     | NO          | null                                        | NO             | null           | null           |
| events                      | sub_category         | text                     | YES         | null                                        | NO             | null           | null           |
| events                      | level                | USER-DEFINED             | YES         | 'standard'::event_level                     | NO             | null           | null           |
| events                      | age_group            | text                     | YES         | null                                        | NO             | null           | null           |
| events                      | quota_per_house      | integer                  | NO          | 0                                           | NO             | null           | null           |
| events                      | playing_lineup       | integer                  | YES         | 0                                           | NO             | null           | null           |
| events                      | reserved_u18         | integer                  | YES         | 0                                           | NO             | null           | null           |
| events                      | substitutes          | integer                  | YES         | 0                                           | NO             | null           | null           |
| events                      | total_players        | integer                  | YES         | 0                                           | NO             | null           | null           |
| events                      | group_stage_desc     | text                     | YES         | null                                        | NO             | null           | null           |
| events                      | playoff_desc         | text                     | YES         | null                                        | NO             | null           | null           |
| events                      | points_1st           | integer                  | YES         | 0                                           | NO             | null           | null           |
| events                      | points_2nd           | integer                  | YES         | 0                                           | NO             | null           | null           |
| events                      | points_3rd           | integer                  | YES         | 0                                           | NO             | null           | null           |
| events                      | points_4th           | integer                  | YES         | 0                                           | NO             | null           | null           |
| events                      | participation_points | integer                  | YES         | 0                                           | NO             | null           | null           |
| events                      | is_team_event        | boolean                  | YES         | false                                       | NO             | null           | null           |
| events                      | created_at           | timestamp with time zone | YES         | now()                                       | NO             | null           | null           |
| events                      | top_8_points         | integer                  | YES         | 0                                           | NO             | null           | null           |
| fitness_logs                | id                   | uuid                     | NO          | gen_random_uuid()                           | YES            | null           | null           |
| fitness_logs                | student_tr           | bigint                   | NO          | null                                        | NO             | profiles       | tr_number      |
| fitness_logs                | speed                | numeric                  | YES         | null                                        | NO             | null           | null           |
| fitness_logs                | agility              | numeric                  | YES         | null                                        | NO             | null           | null           |
| fitness_logs                | endurance            | numeric                  | YES         | null                                        | NO             | null           | null           |
| fitness_logs                | strength             | numeric                  | YES         | null                                        | NO             | null           | null           |
| fitness_logs                | flexibility          | numeric                  | YES         | null                                        | NO             | null           | null           |
| fitness_logs                | logged_at            | timestamp with time zone | YES         | now()                                       | NO             | null           | null           |
| hizb                        | id                   | uuid                     | NO          | gen_random_uuid()                           | YES            | null           | null           |
| hizb                        | name                 | text                     | NO          | null                                        | NO             | null           | null           |
| hizb                        | house_id             | uuid                     | NO          | null                                        | NO             | houses         | id             |
| hizb                        | created_at           | timestamp with time zone | YES         | now()                                       | NO             | null           | null           |
| house_leaderboard_view      | season_id            | uuid                     | YES         | null                                        | NO             | null           | null           |
| house_leaderboard_view      | house_id             | uuid                     | YES         | null                                        | NO             | null           | null           |
| house_leaderboard_view      | house_name           | text                     | YES         | null                                        | NO             | null           | null           |
| house_leaderboard_view      | house_color          | text                     | YES         | null                                        | NO             | null           | null           |
| house_leaderboard_view      | total_points         | integer                  | YES         | null                                        | NO             | null           | null           |
| house_leaderboard_view      | placement_points     | integer                  | YES         | null                                        | NO             | null           | null           |
| house_leaderboard_view      | participation_points | integer                  | YES         | null                                        | NO             | null           | null           |
| house_leaderboard_view      | bonus_points         | integer                  | YES         | null                                        | NO             | null           | null           |
| house_leaderboard_view      | member_count         | integer                  | YES         | null                                        | NO             | null           | null           |
| houses                      | id                   | uuid                     | NO          | gen_random_uuid()                           | YES            | null           | null           |
| houses                      | name                 | text                     | NO          | null                                        | NO             | null           | null           |
| houses                      | color                | text                     | NO          | null                                        | NO             | null           | null           |
| houses                      | created_at           | timestamp with time zone | YES         | now()                                       | NO             | null           | null           |
| match_request_players       | id                   | uuid                     | NO          | gen_random_uuid()                           | YES            | null           | null           |
| match_request_players       | request_id           | uuid                     | NO          | null                                        | NO             | match_requests | id             |
| match_request_players       | joined_at            | timestamp with time zone | NO          | now()                                       | NO             | null           | null           |
| match_request_players       | student_tr           | bigint                   | YES         | null                                        | NO             | profiles       | tr_number      |
| match_requests              | id                   | uuid                     | NO          | gen_random_uuid()                           | YES            | null           | null           |
| match_requests              | sport_id             | uuid                     | NO          | null                                        | NO             | sports         | id             |
| match_requests              | created_by           | bigint                   | NO          | null                                        | NO             | profiles       | tr_number      |
| match_requests              | title                | text                     | NO          | null                                        | NO             | null           | null           |
| match_requests              | description          | text                     | YES         | null                                        | NO             | null           | null           |
| match_requests              | event_date           | timestamp with time zone | YES         | null                                        | NO             | null           | null           |
| match_requests              | location             | text                     | YES         | null                                        | NO             | null           | null           |
| match_requests              | max_players          | integer                  | NO          | 10                                          | NO             | null           | null           |
| match_requests              | status               | USER-DEFINED             | NO          | 'open'::match_request_status                | NO             | null           | null           |
| match_requests              | created_at           | timestamp with time zone | NO          | now()                                       | NO             | null           | null           |
| matches                     | id                   | uuid                     | NO          | gen_random_uuid()                           | YES            | null           | null           |
| matches                     | season_id            | uuid                     | NO          | null                                        | NO             | seasons        | id             |
| matches                     | event_id             | uuid                     | NO          | null                                        | NO             | events         | id             |
| matches                     | match_date           | timestamp with time zone | YES         | null                                        | NO             | null           | null           |
| matches                     | stage                | USER-DEFINED             | YES         | 'group'::match_stage                        | NO             | null           | null           |
| matches                     | home_team_id         | uuid                     | YES         | null                                        | NO             | teams          | id             |
| matches                     | away_team_id         | uuid                     | YES         | null                                        | NO             | teams          | id             |
| matches                     | home_score           | numeric                  | YES         | null                                        | NO             | null           | null           |
| matches                     | away_score           | numeric                  | YES         | null                                        | NO             | null           | null           |
| matches                     | winner_team_id       | uuid                     | YES         | null                                        | NO             | teams          | id             |
| matches                     | home_runs_for        | numeric                  | YES         | null                                        | NO             | null           | null           |
| matches                     | home_overs_faced     | numeric                  | YES         | null                                        | NO             | null           | null           |
| matches                     | away_runs_for        | numeric                  | YES         | null                                        | NO             | null           | null           |
| matches                     | away_overs_faced     | numeric                  | YES         | null                                        | NO             | null           | null           |
| matches                     | created_at           | timestamp with time zone | YES         | now()                                       | NO             | null           | null           |
| participations              | id                   | uuid                     | NO          | gen_random_uuid()                           | YES            | null           | null           |
| participations              | season_id            | uuid                     | NO          | null                                        | NO             | seasons        | id             |
| participations              | event_id             | uuid                     | NO          | null                                        | NO             | events         | id             |
| participations              | student_tr           | bigint                   | YES         | null                                        | NO             | profiles       | tr_number      |
| participations              | team_id              | uuid                     | YES         | null                                        | NO             | teams          | id             |
| participations              | house_id             | uuid                     | NO          | null                                        | NO             | houses         | id             |
| participations              | hizb_id              | uuid                     | YES         | null                                        | NO             | hizb           | id             |
| participations              | status               | USER-DEFINED             | YES         | 'registered'::participation_status          | NO             | null           | null           |
| participations              | is_wildcard          | boolean                  | YES         | false                                       | NO             | null           | null           |
| participations              | registered_at        | timestamp with time zone | YES         | now()                                       | NO             | null           | null           |
| point_transactions          | id                   | uuid                     | NO          | gen_random_uuid()                           | YES            | null           | null           |
| point_transactions          | season_id            | uuid                     | NO          | null                                        | NO             | seasons        | id             |
| point_transactions          | house_id             | uuid                     | NO          | null                                        | NO             | houses         | id             |
| point_transactions          | student_tr           | bigint                   | YES         | null                                        | NO             | profiles       | tr_number      |
| point_transactions          | event_id             | uuid                     | YES         | null                                        | NO             | events         | id             |
| point_transactions          | source               | USER-DEFINED             | NO          | null                                        | NO             | null           | null           |
| point_transactions          | points               | integer                  | NO          | null                                        | NO             | null           | null           |
| point_transactions          | description          | text                     | YES         | null                                        | NO             | null           | null           |
| point_transactions          | created_at           | timestamp with time zone | YES         | now()                                       | NO             | null           | null           |
| profiles                    | tr_number            | bigint                   | NO          | null                                        | YES            | null           | null           |
| profiles                    | user_id              | uuid                     | YES         | null                                        | NO             | null           | null           |
| profiles                    | edu_email            | text                     | YES         | null                                        | NO             | null           | null           |
| profiles                    | full_name            | text                     | YES         | null                                        | NO             | null           | null           |
| profiles                    | birth_date           | date                     | YES         | null                                        | NO             | null           | null           |
| profiles                    | age_category         | text                     | YES         | null                                        | NO             | null           | null           |
| profiles                    | house_id             | uuid                     | YES         | null                                        | NO             | houses         | id             |
| profiles                    | hizb_id              | uuid                     | YES         | null                                        | NO             | hizb           | id             |
| profiles                    | avatar_url           | text                     | YES         | null                                        | NO             | null           | null           |
| profiles                    | created_at           | timestamp with time zone | YES         | now()                                       | NO             | null           | null           |
| profiles                    | updated_at           | timestamp with time zone | YES         | now()                                       | NO             | null           | null           |
| profiles                    | its_number           | integer                  | YES         | null                                        | NO             | null           | null           |
| profiles                    | darajah              | smallint                 | YES         | null                                        | NO             | null           | null           |
| profiles                    | class_name           | text                     | YES         | null                                        | NO             | null           | null           |
| profiles                    | is_under_18          | boolean                  | YES         | null                                        | NO             | null           | null           |
| seasons                     | id                   | uuid                     | NO          | gen_random_uuid()                           | YES            | null           | null           |
| seasons                     | name                 | text                     | NO          | null                                        | NO             | null           | null           |
| seasons                     | start_date           | date                     | YES         | null                                        | NO             | null           | null           |
| seasons                     | end_date             | date                     | YES         | null                                        | NO             | null           | null           |
| seasons                     | is_active            | boolean                  | YES         | false                                       | NO             | null           | null           |
| seasons                     | created_at           | timestamp with time zone | YES         | now()                                       | NO             | null           | null           |
| sport_self_assessments      | id                   | uuid                     | NO          | gen_random_uuid()                           | YES            | null           | null           |
| sport_self_assessments      | sport_id             | uuid                     | NO          | null                                        | NO             | sports         | id             |
| sport_self_assessments      | experience_level     | text                     | NO          | null                                        | NO             | null           | null           |
| sport_self_assessments      | skill_rating         | integer                  | NO          | null                                        | NO             | null           | null           |
| sport_self_assessments      | years_of_practice    | integer                  | NO          | 0                                           | NO             | null           | null           |
| sport_self_assessments      | created_at           | timestamp with time zone | NO          | now()                                       | NO             | null           | null           |
| sport_self_assessments      | student_tr           | bigint                   | YES         | null                                        | NO             | profiles       | tr_number      |
| sports                      | id                   | uuid                     | NO          | gen_random_uuid()                           | YES            | null           | null           |
| sports                      | name                 | text                     | NO          | null                                        | NO             | null           | null           |
| sports                      | sport_type           | USER-DEFINED             | NO          | 'individual'::sport_type                    | NO             | null           | null           |
| sports                      | created_at           | timestamp with time zone | YES         | now()                                       | NO             | null           | null           |
| sports                      | category             | text                     | YES         | null                                        | NO             | null           | null           |
| sports_interests            | id                   | uuid                     | NO          | gen_random_uuid()                           | YES            | null           | null           |
| sports_interests            | sport_id             | uuid                     | NO          | null                                        | NO             | sports         | id             |
| sports_interests            | interest_level       | USER-DEFINED             | NO          | 'curious'::interest_level                   | NO             | null           | null           |
| sports_interests            | confidence_level     | USER-DEFINED             | NO          | 'low'::confidence_level                     | NO             | null           | null           |
| sports_interests            | created_by           | USER-DEFINED             | NO          | 'student'::interest_created_by              | NO             | null           | null           |
| sports_interests            | notes                | text                     | YES         | null                                        | NO             | null           | null           |
| sports_interests            | created_at           | timestamp with time zone | NO          | now()                                       | NO             | null           | null           |
| sports_interests            | updated_at           | timestamp with time zone | NO          | now()                                       | NO             | null           | null           |
| sports_interests            | is_identified_talent | boolean                  | NO          | false                                       | NO             | null           | null           |
| sports_interests            | student_tr           | bigint                   | YES         | null                                        | NO             | profiles       | tr_number      |
| student_event_roles         | id                   | uuid                     | NO          | gen_random_uuid()                           | YES            | null           | null           |
| student_event_roles         | student_tr           | bigint                   | NO          | null                                        | NO             | profiles       | tr_number      |
| student_event_roles         | event_id             | uuid                     | NO          | null                                        | NO             | events         | id             |
| student_event_roles         | season_id            | uuid                     | NO          | null                                        | NO             | seasons        | id             |
| student_event_roles         | role                 | USER-DEFINED             | NO          | null                                        | NO             | null           | null           |
| student_rankings_view       | season_id            | uuid                     | YES         | null                                        | NO             | null           | null           |
| student_rankings_view       | student_tr           | bigint                   | YES         | null                                        | NO             | null           | null           |
| student_rankings_view       | student_name         | text                     | YES         | null                                        | NO             | null           | null           |
| student_rankings_view       | house_id             | uuid                     | YES         | null                                        | NO             | null           | null           |
| student_rankings_view       | house_name           | text                     | YES         | null                                        | NO             | null           | null           |
| student_rankings_view       | user_id              | uuid                     | YES         | null                                        | NO             | null           | null           |
| student_rankings_view       | total_points         | integer                  | YES         | null                                        | NO             | null           | null           |
| student_rankings_view       | placements           | integer                  | YES         | null                                        | NO             | null           | null           |
| student_rankings_view       | participations       | integer                  | YES         | null                                        | NO             | null           | null           |
| student_selections          | id                   | uuid                     | NO          | gen_random_uuid()                           | YES            | null           | null           |
| student_selections          | season_id            | uuid                     | NO          | null                                        | NO             | seasons        | id             |
| student_selections          | house_id             | uuid                     | NO          | null                                        | NO             | houses         | id             |
| student_selections          | sport_id             | uuid                     | NO          | null                                        | NO             | sports         | id             |
| student_selections          | category             | text                     | NO          | null                                        | NO             | null           | null           |
| student_selections          | rank                 | integer                  | NO          | null                                        | NO             | null           | null           |
| student_selections          | student_tr           | bigint                   | NO          | null                                        | NO             | profiles       | tr_number      |
| student_selections          | eligibility          | text                     | YES         | 'Eligible'::text                            | NO             | null           | null           |
| student_selections          | created_at           | timestamp with time zone | YES         | now()                                       | NO             | null           | null           |
| student_selections          | is_final             | boolean                  | NO          | false                                       | NO             | null           | null           |
| student_selections          | is_locked            | boolean                  | NO          | false                                       | NO             | null           | null           |
| student_selections          | created_by           | bigint                   | YES         | null                                        | NO             | profiles       | tr_number      |
| student_sport_proficiencies | id                   | uuid                     | NO          | gen_random_uuid()                           | YES            | null           | null           |
| student_sport_proficiencies | sport_id             | uuid                     | NO          | null                                        | NO             | sports         | id             |
| student_sport_proficiencies | level                | USER-DEFINED             | NO          | 'beginner'::proficiency_level               | NO             | null           | null           |
| student_sport_proficiencies | source               | text                     | NO          | 'self'::text                                | NO             | null           | null           |
| student_sport_proficiencies | updated_at           | timestamp with time zone | NO          | now()                                       | NO             | null           | null           |
| student_sport_proficiencies | created_at           | timestamp with time zone | NO          | now()                                       | NO             | null           | null           |
| student_sport_proficiencies | student_tr           | bigint                   | YES         | null                                        | NO             | profiles       | tr_number      |
| student_sport_scores        | id                   | uuid                     | NO          | gen_random_uuid()                           | YES            | null           | null           |
| student_sport_scores        | sport_id             | uuid                     | NO          | null                                        | NO             | sports         | id             |
| student_sport_scores        | competition_score    | integer                  | NO          | 0                                           | NO             | null           | null           |
| student_sport_scores        | club_score           | integer                  | NO          | 0                                           | NO             | null           | null           |
| student_sport_scores        | activity_score       | integer                  | NO          | 0                                           | NO             | null           | null           |
| student_sport_scores        | fitness_score        | integer                  | NO          | 0                                           | NO             | null           | null           |
| student_sport_scores        | total_score          | integer                  | NO          | 0                                           | NO             | null           | null           |
| student_sport_scores        | proficiency_level    | USER-DEFINED             | NO          | 'beginner'::proficiency_level               | NO             | null           | null           |
| student_sport_scores        | last_calculated      | timestamp with time zone | NO          | now()                                       | NO             | null           | null           |
| student_sport_scores        | student_tr           | bigint                   | YES         | null                                        | NO             | profiles       | tr_number      |
| team_members                | id                   | uuid                     | NO          | gen_random_uuid()                           | YES            | null           | null           |
| team_members                | team_id              | uuid                     | NO          | null                                        | NO             | teams          | id             |
| team_members                | student_tr           | bigint                   | NO          | null                                        | NO             | profiles       | tr_number      |
| team_members                | role                 | USER-DEFINED             | YES         | 'player'::event_role                        | NO             | null           | null           |
| team_standings              | id                   | uuid                     | NO          | gen_random_uuid()                           | YES            | null           | null           |
| team_standings              | season_id            | uuid                     | NO          | null                                        | NO             | seasons        | id             |
| team_standings              | event_id             | uuid                     | NO          | null                                        | NO             | events         | id             |
| team_standings              | team_id              | uuid                     | NO          | null                                        | NO             | teams          | id             |
| team_standings              | played               | integer                  | YES         | 0                                           | NO             | null           | null           |
| team_standings              | won                  | integer                  | YES         | 0                                           | NO             | null           | null           |
| team_standings              | lost                 | integer                  | YES         | 0                                           | NO             | null           | null           |
| team_standings              | drawn                | integer                  | YES         | 0                                           | NO             | null           | null           |
| team_standings              | goal_diff            | numeric                  | YES         | 0                                           | NO             | null           | null           |
| team_standings              | net_run_rate         | numeric                  | YES         | 0                                           | NO             | null           | null           |
| team_standings              | points               | integer                  | YES         | 0                                           | NO             | null           | null           |
| team_standings              | goals_for            | numeric                  | YES         | 0                                           | NO             | null           | null           |
| team_standings              | goals_against        | numeric                  | YES         | 0                                           | NO             | null           | null           |
| teams                       | id                   | uuid                     | NO          | gen_random_uuid()                           | YES            | null           | null           |
| teams                       | name                 | text                     | YES         | null                                        | NO             | null           | null           |
| teams                       | house_id             | uuid                     | YES         | null                                        | NO             | houses         | id             |
| teams                       | event_id             | uuid                     | YES         | null                                        | NO             | events         | id             |
| teams                       | age_group            | text                     | YES         | null                                        | NO             | null           | null           |
| teams                       | created_at           | timestamp with time zone | YES         | now()                                       | NO             | null           | null           |
| temp_student_houses         | tr_number            | bigint                   | YES         | null                                        | NO             | null           | null           |
| temp_student_houses         | hizb_id              | uuid                     | YES         | null                                        | NO             | null           | null           |
| temp_student_houses         | house_id             | uuid                     | YES         | null                                        | NO             | null           | null           |
| training_attendance         | id                   | uuid                     | NO          | gen_random_uuid()                           | YES            | null           | null           |
| training_attendance         | training_id          | uuid                     | NO          | null                                        | NO             | trainings      | id             |
| training_attendance         | student_tr           | bigint                   | NO          | null                                        | NO             | profiles       | tr_number      |
| training_attendance         | attended_at          | timestamp with time zone | YES         | now()                                       | NO             | null           | null           |
| trainings                   | id                   | uuid                     | NO          | gen_random_uuid()                           | YES            | null           | null           |
| trainings                   | name                 | text                     | NO          | null                                        | NO             | null           | null           |
| trainings                   | event_id             | uuid                     | YES         | null                                        | NO             | events         | id             |
| trainings                   | season_id            | uuid                     | YES         | null                                        | NO             | seasons        | id             |
| trainings                   | created_at           | timestamp with time zone | YES         | now()                                       | NO             | null           | null           |
| user_roles                  | id                   | uuid                     | NO          | gen_random_uuid()                           | YES            | null           | null           |
| user_roles                  | role                 | USER-DEFINED             | NO          | null                                        | NO             | null           | null           |
| user_roles                  | student_tr           | bigint                   | NO          | null                                        | NO             | profiles       | tr_number      |
| wildcard_programs           | id                   | uuid                     | NO          | gen_random_uuid()                           | YES            | null           | null           |
| wildcard_programs           | event_id             | uuid                     | NO          | null                                        | NO             | events         | id             |
| wildcard_programs           | program_name         | text                     | YES         | null                                        | NO             | null           | null           |
| wildcard_programs           | quota_per_house      | integer                  | YES         | 0                                           | NO             | null           | null           |
| wildcard_programs           | created_at           | timestamp with time zone | YES         | now()                                       | NO             | null           | null           |

## ⚙️ Business Logic (The "Brain" of the DB)
> **Admin Note**: To make Gemini 10x more helpful, run these 3 queries in Supabase and paste the results here.

### 1. View Definitions
*Helps Gemini understand how Leaderboards are calculated.*
**Query**: `SELECT viewname, definition FROM pg_views WHERE schemaname = 'public';`
| viewname               | definition                                                                                                                                                                                                                                                          
| house_leaderboard_view |  SELECT pt.season_id,
    pt.house_id,
    h.name AS house_name,
    h.color AS house_color,
    (COALESCE(sum(pt.points), (0)::bigint))::integer AS total_points,
    (COALESCE(sum(pt.points) FILTER (WHERE (pt.source = 'placement'::point_source)), (0)::bigint))::integer AS placement_points,
    (COALESCE(sum(pt.points) FILTER (WHERE (pt.source = 'participation'::point_source)), (0)::bigint))::integer AS participation_points,
    (COALESCE(sum(pt.points) FILTER (WHERE (pt.source = 'bonus'::point_source)), (0)::bigint))::integer AS bonus_points,
    ( SELECT (count(*))::integer AS count
           FROM profiles p
          WHERE (p.house_id = pt.house_id)) AS member_count
   FROM (point_transactions pt
     JOIN houses h ON ((h.id = pt.house_id)))
  GROUP BY pt.season_id, pt.house_id, h.name, h.color; |
| student_rankings_view  |  SELECT pt.season_id,
    pt.student_tr,
    pr.full_name AS student_name,
    pr.house_id,
    h.name AS house_name,
    pr.user_id,
    (COALESCE(sum(pt.points), (0)::bigint))::integer AS total_points,
    (count(*) FILTER (WHERE (pt.source = 'placement'::point_source)))::integer AS placements,
    (count(*) FILTER (WHERE (pt.source = 'participation'::point_source)))::integer AS participations
   FROM ((point_transactions pt
     JOIN profiles pr ON ((pr.tr_number = pt.student_tr)))
     LEFT JOIN houses h ON ((h.id = pr.house_id)))
  WHERE (pt.student_tr IS NOT NULL)
  GROUP BY pt.season_id, pt.student_tr, pr.full_name, pr.house_id, h.name, pr.user_id;                                                                                                                                                    |

### 2. Custom Functions (RPCs)
*Crucial for role checks and automated scoring.*
**Query**: `SELECT routine_name, routine_definition FROM information_schema.routines WHERE routine_schema = 'public' AND routine_type = 'FUNCTION';`
| routine_name                           | routine_definition                                                                                                                 
| update_updated_at                      | 
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
                                                                                                                                                        |
| handle_new_user                        | 
DECLARE
  v_tr_number BIGINT;
BEGIN
  -- Try to find an existing profile by edu_email
  SELECT tr_number INTO v_tr_number FROM public.profiles WHERE edu_email = NEW.email;

  IF v_tr_number IS NOT NULL THEN
    -- Update existing profile with user_id
    UPDATE public.profiles SET user_id = NEW.id WHERE tr_number = v_tr_number;
  ELSE
    -- This case shouldn't happen much with pre-registration, but for safety:
    -- We can't insert a profile without a tr_number if it's the primary key.
    -- If tr_number is required, we might need a fallback or just fail.
    -- Assuming tr_number is NOT auto-generated based on the schema.
    RETURN NEW; 
  END IF;
  
  -- Ensure student role exists for this tr_number
  INSERT INTO public.user_roles (student_tr, role)
  VALUES (v_tr_number, 'student')
  ON CONFLICT (student_tr, role) DO NOTHING;
  
  RETURN NEW;
END;
                                                                                                |
| has_role                               | 
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.profiles p ON p.tr_number = ur.student_tr
    WHERE p.user_id = _user_id AND ur.role = _role
  )
                       |
| auto_interest_on_participation         | 
DECLARE
  v_sport_id uuid;
  v_interest_rank int;
  v_existing_rank int;
BEGIN
  -- Get sport_id from the event
  SELECT e.sport_id INTO v_sport_id
  FROM events e WHERE e.id = NEW.event_id;
  
  IF v_sport_id IS NULL OR NEW.student_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Interest level ranking: curious=1, beginner=2, learning=3, active=4, competitive=5
  v_interest_rank := 4; -- 'active'

  -- Check existing interest level
  SELECT CASE interest_level
    WHEN 'curious' THEN 1
    WHEN 'beginner' THEN 2
    WHEN 'learning' THEN 3
    WHEN 'active' THEN 4
    WHEN 'competitive' THEN 5
    ELSE 0
  END INTO v_existing_rank
  FROM sports_interests
  WHERE student_id = NEW.student_id AND sport_id = v_sport_id;

  IF v_existing_rank IS NULL THEN
    -- No record exists, create one
    INSERT INTO sports_interests (student_id, sport_id, interest_level, confidence_level, created_by)
    VALUES (NEW.student_id, v_sport_id, 'active', 'medium', 'admin');
  ELSIF v_existing_rank < v_interest_rank THEN
    -- Upgrade only if current level is lower
    UPDATE sports_interests
    SET interest_level = 'active', updated_at = now()
    WHERE student_id = NEW.student_id AND sport_id = v_sport_id;
  END IF;

  RETURN NEW;
END;
                                                                                                                                              |
| auto_interest_on_result                | 
DECLARE
  v_sport_id uuid;
  v_student_id uuid;
  v_existing_rank int;
BEGIN
  -- Get student_id and sport_id from participation → event
  SELECT p.student_id, e.sport_id INTO v_student_id, v_sport_id
  FROM participations p
  JOIN events e ON e.id = p.event_id
  WHERE p.id = NEW.participation_id;

  IF v_sport_id IS NULL OR v_student_id IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT CASE interest_level
    WHEN 'curious' THEN 1
    WHEN 'beginner' THEN 2
    WHEN 'learning' THEN 3
    WHEN 'active' THEN 4
    WHEN 'competitive' THEN 5
    ELSE 0
  END INTO v_existing_rank
  FROM sports_interests
  WHERE student_id = v_student_id AND sport_id = v_sport_id;

  IF v_existing_rank IS NULL THEN
    INSERT INTO sports_interests (student_id, sport_id, interest_level, confidence_level, created_by)
    VALUES (v_student_id, v_sport_id, 'competitive', 'high', 'admin');
  ELSIF v_existing_rank < 5 THEN
    UPDATE sports_interests
    SET interest_level = 'competitive', confidence_level = 'high', updated_at = now()
    WHERE student_id = v_student_id AND sport_id = v_sport_id;
  END IF;

  RETURN NEW;
END;
   |
| auto_match_request_status              | 
DECLARE
  v_count int;
  v_max int;
BEGIN
  SELECT COUNT(*) INTO v_count
  FROM match_request_players WHERE request_id = NEW.request_id;

  SELECT max_players INTO v_max
  FROM match_requests WHERE id = NEW.request_id;

  IF v_count >= v_max THEN
    UPDATE match_requests SET status = 'full' WHERE id = NEW.request_id AND status = 'open';
  END IF;

  RETURN NEW;
END;
                                                                                                                                                                                                                                                                                                                                                                   |
| auto_match_request_reopen              | 
DECLARE
  v_count int;
  v_max int;
BEGIN
  SELECT COUNT(*) INTO v_count
  FROM match_request_players WHERE request_id = OLD.request_id;

  SELECT max_players INTO v_max
  FROM match_requests WHERE id = OLD.request_id;

  IF v_count < v_max THEN
    UPDATE match_requests SET status = 'open' WHERE id = OLD.request_id AND status = 'full';
  END IF;

  RETURN OLD;
END;
                                                                                              |
| auto_interest_on_club_event_attendance | 
DECLARE
  v_sport_id uuid;
  v_attended_count int;
  v_existing_rank int;
  v_existing_confidence text;
BEGIN
  IF NEW.status <> 'attended' THEN RETURN NEW; END IF;
  IF OLD IS NOT NULL AND OLD.status = 'attended' THEN RETURN NEW; END IF;

  SELECT c.sport_id INTO v_sport_id
  FROM club_events ce
  JOIN clubs c ON c.id = ce.club_id
  WHERE ce.id = NEW.club_event_id;

  IF v_sport_id IS NULL THEN RETURN NEW; END IF;

  SELECT COUNT(*) INTO v_attended_count
  FROM club_event_participants cep
  JOIN club_events ce ON ce.id = cep.club_event_id
  JOIN clubs c ON c.id = ce.club_id
  WHERE cep.student_tr = NEW.student_tr
    AND cep.status = 'attended'
    AND c.sport_id = v_sport_id;

  SELECT
    CASE interest_level
      WHEN 'curious' THEN 1 WHEN 'beginner' THEN 2 WHEN 'learning' THEN 3
      WHEN 'active' THEN 4 WHEN 'competitive' THEN 5 ELSE 0
    END,
    confidence_level::text
  INTO v_existing_rank, v_existing_confidence
  FROM sports_interests
  WHERE student_tr = NEW.student_tr AND sport_id = v_sport_id;

  IF v_attended_count >= 3 THEN
    IF v_existing_rank IS NULL THEN
      INSERT INTO sports_interests (student_tr, sport_id, interest_level, confidence_level, created_by)
      VALUES (NEW.student_tr, v_sport_id, 'learning', 'medium', 'admin');
    ELSIF v_existing_confidence = 'low' THEN
      UPDATE sports_interests
      SET confidence_level = 'medium', updated_at = now()
      WHERE student_tr = NEW.student_tr AND sport_id = v_sport_id;
    END IF;
  END IF;

  IF v_attended_count >= 10 THEN
    IF v_existing_rank IS NOT NULL AND v_existing_rank < 4 THEN
      UPDATE sports_interests
      SET interest_level = 'active', updated_at = now()
      WHERE student_tr = NEW.student_tr AND sport_id = v_sport_id;
    ELSIF v_existing_rank IS NULL THEN
      INSERT INTO sports_interests (student_tr, sport_id, interest_level, confidence_level, created_by)
      VALUES (NEW.student_tr, v_sport_id, 'active', 'medium', 'admin')
      ON CONFLICT (student_tr, sport_id) DO UPDATE
      SET interest_level = 'active', updated_at = now()
      WHERE sports_interests.interest_level IN ('curious','beginner','learning');
    END IF;
  END IF;

  RETURN NEW;
END;
                                              |
| recalculate_all_sport_scores           | 
DECLARE
  rec RECORD;
  v_count int := 0;
BEGIN
  FOR rec IN
    SELECT DISTINCT student_tr, sport_id FROM (
      SELECT student_tr, e.sport_id FROM participations p JOIN events e ON e.id = p.event_id
      UNION
      SELECT student_tr, c.sport_id FROM club_members cm JOIN clubs c ON c.id = cm.club_id
      UNION
      SELECT student_tr, mr.sport_id FROM match_request_players mrp JOIN match_requests mr ON mr.id = mrp.request_id
      UNION
      SELECT student_tr, sport_id FROM sports_interests
    ) all_combos
  LOOP
    PERFORM calculate_student_sport_score(rec.student_tr, rec.sport_id);
    v_count := v_count + 1;
  END LOOP;
  RETURN v_count;
END;
                                                                                                                                                                           |
| generate_certificate_number            | 
DECLARE
  v_seq bigint;
BEGIN
  v_seq := nextval('public.certificate_seq');
  RETURN 'AJS-SP-' || p_year::text || '-' || LPAD(v_seq::text, 4, '0');
END;
                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| prevent_certificate_modification       | 
BEGIN
  IF (TG_OP = 'UPDATE') THEN
    IF (OLD.status = 'issued' AND NEW.status <> 'revoked') THEN
      RAISE EXCEPTION 'Issued certificates cannot be modified except for revocation';
    END IF;
    IF (OLD.status = 'issued' AND NEW.status = 'revoked') THEN
      NEW.student_id := OLD.student_id;
      NEW.sport_id := OLD.sport_id;
      NEW.score_snapshot := OLD.score_snapshot;
      NEW.proficiency_level := OLD.proficiency_level;
      NEW.certificate_number := OLD.certificate_number;
      NEW.issued_by := OLD.issued_by;
      NEW.issued_at := OLD.issued_at;
      NEW.valid_year := OLD.valid_year;
    END IF;
  ELSIF (TG_OP = 'DELETE') THEN
    IF (OLD.status = 'issued') THEN
      RAISE EXCEPTION 'Issued certificates cannot be deleted';
    END IF;
  END IF;
  RETURN NEW;
END;
                                                                                                                                                                                                 |
| handle_new_user_linking                | 
   DECLARE
     v_tr_number BIGINT;
   BEGIN
     -- 1. Link existing profile
     SELECT tr_number INTO v_tr_number 
     FROM public.profiles 
     WHERE LOWER(TRIM(edu_email)) = LOWER(TRIM(NEW.email));

     IF v_tr_number IS NOT NULL THEN
       -- 2. Link profile to auth user
       UPDATE public.profiles
       SET user_id = NEW.id,
           updated_at = NOW()
       WHERE tr_number = v_tr_number;

       -- 3. Add student role using student_tr column
       INSERT INTO public.user_roles (student_tr, role)
       VALUES (v_tr_number, 'student')
       ON CONFLICT (student_tr, role) DO NOTHING;
     END IF;

     RETURN NEW;
   END;
    || calculate_student_sport_score          | 
DECLARE
  v_comp_score int := 0;
  v_club_score int := 0;
  v_activity_score int := 0;
  v_fitness_score int := 0;
  v_total int;
  v_level proficiency_level;
BEGIN
  -- 1. Competition score: placements + participation (CAP: 60)
  SELECT COALESCE(SUM(
    CASE 
      WHEN r.placement = 1 THEN 20
      WHEN r.placement = 2 THEN 15
      WHEN r.placement = 3 THEN 10
      ELSE 0
    END
  ), 0) INTO v_comp_score
  FROM results r
  JOIN participations p ON p.id = r.participation_id
  JOIN events e ON e.id = r.event_id
  WHERE p.student_id = p_student_id AND e.sport_id = p_sport_id;

  v_comp_score := v_comp_score + COALESCE((
    SELECT COUNT(*) * 3
    FROM participations p
    JOIN events e ON e.id = p.event_id
    WHERE p.student_id = p_student_id AND e.sport_id = p_sport_id
  ), 0);

  v_comp_score := LEAST(v_comp_score, 60);

  -- 2. Club score (CAP: 25)
  v_club_score := COALESCE((
    SELECT COUNT(*) * 2
    FROM club_event_participants cep
    JOIN club_events ce ON ce.id = cep.club_event_id
    JOIN clubs c ON c.id = ce.club_id
    WHERE cep.student_id = p_student_id 
      AND c.sport_id = p_sport_id 
      AND cep.status = 'attended'
  ), 0);

  IF v_club_score >= 20 THEN
    v_club_score := v_club_score + 5;
  END IF;

  v_club_score := v_club_score + COALESCE((
    SELECT COUNT(*) * 3
    FROM club_events ce
    JOIN clubs c ON c.id = ce.club_id
    WHERE ce.created_by = p_student_id AND c.sport_id = p_sport_id
  ), 0);

  v_club_score := LEAST(v_club_score, 25);

  -- 3. Activity score (CAP: 20)
  v_activity_score := COALESCE((
    SELECT COUNT(*) * 2
    FROM match_request_players mrp
    JOIN match_requests mr ON mr.id = mrp.request_id
    WHERE mrp.student_id = p_student_id AND mr.sport_id = p_sport_id
  ), 0);

  v_activity_score := v_activity_score + COALESCE((
    SELECT COUNT(*) * 3
    FROM match_requests mr
    WHERE mr.created_by = p_student_id AND mr.sport_id = p_sport_id
  ), 0);

  v_activity_score := LEAST(v_activity_score, 20);

  -- 4. Fitness score (CAP: 15)
  v_fitness_score := LEAST(COALESCE((
    SELECT COUNT(*) * 2
    FROM fitness_logs
    WHERE student_id = p_student_id
  ), 0), 15);

  -- Total (max theoretical: 120, capped at 100)
  v_total := LEAST(v_comp_score + v_club_score + v_activity_score + v_fitness_score, 100);

  v_level := CASE
    WHEN v_total >= 81 THEN 'master'
    WHEN v_total >= 61 THEN 'expert'
    WHEN v_total >= 41 THEN 'advanced'
    WHEN v_total >= 21 THEN 'intermediate'
    ELSE 'beginner'
  END;

  INSERT INTO student_sport_scores (student_id, sport_id, competition_score, club_score, activity_score, fitness_score, total_score, proficiency_level, last_calculated)
  VALUES (p_student_id, p_sport_id, v_comp_score, v_club_score, v_activity_score, v_fitness_score, v_total, v_level, now())
  ON CONFLICT (student_id, sport_id)
  DO UPDATE SET
    competition_score = v_comp_score,
    club_score = v_club_score,
    activity_score = v_activity_score,
    fitness_score = v_fitness_score,
    total_score = v_total,
    proficiency_level = v_level,
    last_calculated = now();
END;
 |
| auto_interest_on_club_join             | 
DECLARE
  v_sport_id uuid;
  v_existing_rank int;
BEGIN
  -- Find the sport linked to the club
  SELECT c.sport_id INTO v_sport_id
  FROM clubs c
  WHERE c.id = NEW.club_id;

  IF v_sport_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Check existing interest
  SELECT CASE interest_level
    WHEN 'curious' THEN 1
    WHEN 'beginner' THEN 2
    WHEN 'learning' THEN 3
    WHEN 'active' THEN 4
    WHEN 'competitive' THEN 5
    ELSE 0
  END
  INTO v_existing_rank
  FROM sports_interests
  WHERE student_tr = NEW.student_tr
  AND sport_id = v_sport_id;

  -- If no interest exists → create one
  IF v_existing_rank IS NULL THEN
    INSERT INTO sports_interests (
      student_tr,
      sport_id,
      interest_level,
      confidence_level,
      created_by
    )
    VALUES (
      NEW.student_tr,
      v_sport_id,
      'learning',
      'medium',
      'admin'
    );

  -- If interest is low → upgrade it
  ELSIF v_existing_rank < 3 THEN
    UPDATE sports_interests
    SET
      interest_level = 'learning',
      confidence_level = CASE
        WHEN confidence_level = 'low'
        THEN 'medium'::confidence_level
        ELSE confidence_level
      END,
      updated_at = now()
    WHERE student_tr = NEW.student_tr
    AND sport_id = v_sport_id;
  END IF;

  RETURN NEW;
END;
                                                                                                                                                               |
| auto_interest_on_buddy_match           | 
DECLARE
  v_sport_id uuid;
  v_join_count int;
  v_existing_rank int;
BEGIN
  SELECT mr.sport_id INTO v_sport_id
  FROM match_requests mr WHERE mr.id = NEW.request_id;

  IF v_sport_id IS NULL THEN RETURN NEW; END IF;

  SELECT COUNT(*) INTO v_join_count
  FROM match_request_players mrp
  JOIN match_requests mr ON mr.id = mrp.request_id
  WHERE mrp.student_tr = NEW.student_tr AND mr.sport_id = v_sport_id;

  IF v_join_count >= 5 THEN
    SELECT CASE interest_level
      WHEN 'curious' THEN 1 WHEN 'beginner' THEN 2 WHEN 'learning' THEN 3
      WHEN 'active' THEN 4 WHEN 'competitive' THEN 5 ELSE 0
    END INTO v_existing_rank
    FROM sports_interests
    WHERE student_tr = NEW.student_tr AND sport_id = v_sport_id;

    IF v_existing_rank IS NULL THEN
      INSERT INTO sports_interests (student_tr, sport_id, interest_level, confidence_level, created_by)
      VALUES (NEW.student_tr, v_sport_id, 'active', 'medium', 'admin');
    ELSIF v_existing_rank < 4 THEN
      UPDATE sports_interests
      SET interest_level = 'active', updated_at = now()
      WHERE student_tr = NEW.student_tr AND sport_id = v_sport_id;
    END IF;
  END IF;

  RETURN NEW;
END;


### 3. Custom Enums
*Prevents type errors.*
**Query**: `SELECT t.typname, e.enumlabel FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid ORDER BY 1, e.enumsortorder;`
| typname                       | enumlabel                  |
| ----------------------------- | -------------------------- |
| aal_level                     | aal1                       |
| aal_level                     | aal2                       |
| aal_level                     | aal3                       |
| action                        | INSERT                     |
| action                        | UPDATE                     |
| action                        | DELETE                     |
| action                        | TRUNCATE                   |
| action                        | ERROR                      |
| app_role                      | student                    |
| app_role                      | coach                      |
| app_role                      | admin                      |
| app_role                      | parent                     |
| app_role                      | captain                    |
| app_role                      | co_captain                 |
| buckettype                    | STANDARD                   |
| buckettype                    | ANALYTICS                  |
| buckettype                    | VECTOR                     |
| certification_status          | draft                      |
| certification_status          | issued                     |
| certification_status          | revoked                    |
| club_event_participant_status | registered                 |
| club_event_participant_status | attended                   |
| club_event_participant_status | absent                     |
| club_event_type               | practice                   |
| club_event_type               | friendly_match             |
| club_event_type               | training                   |
| club_event_type               | open_game                  |
| club_member_role              | member                     |
| club_member_role              | incharge                   |
| club_member_role              | sub_incharge               |
| club_member_status            | active                     |
| club_member_status            | inactive                   |
| code_challenge_method         | s256                       |
| code_challenge_method         | plain                      |
| confidence_level              | low                        |
| confidence_level              | medium                     |
| confidence_level              | high                       |
| equality_op                   | eq                         |
| equality_op                   | neq                        |
| equality_op                   | lt                         |
| equality_op                   | lte                        |
| equality_op                   | gt                         |
| equality_op                   | gte                        |
| equality_op                   | in                         |
| event_level                   | prime                      |
| event_level                   | standard                   |
| event_role                    | player                     |
| event_role                    | captain                    |
| event_role                    | coach                      |
| event_role                    | musaid                     |
| event_role                    | substitute                 |
| event_role                    | volunteer                  |
| factor_status                 | unverified                 |
| factor_status                 | verified                   |
| factor_type                   | totp                       |
| factor_type                   | webauthn                   |
| factor_type                   | phone                      |
| interest_created_by           | student                    |
| interest_created_by           | admin                      |
| interest_created_by           | coach                      |
| interest_level                | curious                    |
| interest_level                | beginner                   |
| interest_level                | learning                   |
| interest_level                | active                     |
| interest_level                | competitive                |
| match_request_status          | open                       |
| match_request_status          | full                       |
| match_request_status          | completed                  |
| match_stage                   | group                      |
| match_stage                   | quarterfinal               |
| match_stage                   | semifinal                  |
| match_stage                   | final                      |
| match_stage                   | third_place                |
| oauth_authorization_status    | pending                    |
| oauth_authorization_status    | approved                   |
| oauth_authorization_status    | denied                     |
| oauth_authorization_status    | expired                    |
| oauth_client_type             | public                     |
| oauth_client_type             | confidential               |
| oauth_registration_type       | dynamic                    |
| oauth_registration_type       | manual                     |
| oauth_response_type           | code                       |
| one_time_token_type           | confirmation_token         |
| one_time_token_type           | reauthentication_token     |
| one_time_token_type           | recovery_token             |
| one_time_token_type           | email_change_token_new     |
| one_time_token_type           | email_change_token_current |
| one_time_token_type           | phone_change_token         |
| participation_status          | registered                 |
| participation_status          | selected                   |
| participation_status          | declined                   |
| participation_status          | withdrawn                  |
| point_source                  | placement                  |
| point_source                  | participation              |
| point_source                  | wildcard                   |
| point_source                  | bonus                      |
| point_source                  | penalty                    |
| proficiency_level             | beginner                   |
| proficiency_level             | intermediate               |
| proficiency_level             | advanced                   |
| proficiency_level             | expert                     |
| proficiency_level             | master                     |
| sport_type                    | team                       |
| sport_type                    | individual                 |
