export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      achievements: {
        Row: {
          description: string | null
          earned_at: string | null
          icon: string | null
          id: string
          student_tr: string
          title: string
        }
        Insert: {
          description?: string | null
          earned_at?: string | null
          icon?: string | null
          id?: string
          student_tr: string
          title: string
        }
        Update: {
          description?: string | null
          earned_at?: string | null
          icon?: string | null
          id?: string
          student_tr?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "achievements_student_tr_fkey"
            columns: ["student_tr"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["tr_number"]
          },
        ]
      }
      certifications: {
        Row: {
          certificate_number: string
          created_at: string
          id: string
          issued_at: string | null
          issued_by: string | null
          notes: string | null
          proficiency_level: Database["public"]["Enums"]["proficiency_level"]
          score_snapshot: number
          sport_id: string
          status: Database["public"]["Enums"]["certification_status"]
          student_tr: string
          valid_year: number
        }
        Insert: {
          certificate_number: string
          created_at?: string
          id?: string
          issued_at?: string | null
          issued_by?: string | null
          notes?: string | null
          proficiency_level?: Database["public"]["Enums"]["proficiency_level"]
          score_snapshot?: number
          sport_id: string
          status?: Database["public"]["Enums"]["certification_status"]
          student_tr: string
          valid_year: number
        }
        Update: {
          certificate_number?: string
          created_at?: string
          id?: string
          issued_at?: string | null
          issued_by?: string | null
          notes?: string | null
          proficiency_level?: Database["public"]["Enums"]["proficiency_level"]
          score_snapshot?: number
          sport_id?: string
          status?: Database["public"]["Enums"]["certification_status"]
          student_tr?: string
          valid_year?: number
        }
        Relationships: [
          {
            foreignKeyName: "certifications_issued_by_fkey"
            columns: ["issued_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["tr_number"]
          },
          {
            foreignKeyName: "certifications_sport_id_fkey"
            columns: ["sport_id"]
            isOneToOne: false
            referencedRelation: "sports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "certifications_student_tr_fkey"
            columns: ["student_tr"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["tr_number"]
          },
        ]
      }
      club_event_participants: {
        Row: {
          club_event_id: string
          id: string
          joined_at: string
          status: Database["public"]["Enums"]["club_event_participant_status"]
          student_tr: string
        }
        Insert: {
          club_event_id: string
          id?: string
          joined_at?: string
          status?: Database["public"]["Enums"]["club_event_participant_status"]
          student_tr: string
        }
        Update: {
          club_event_id?: string
          id?: string
          joined_at?: string
          status?: Database["public"]["Enums"]["club_event_participant_status"]
          student_tr?: string
        }
        Relationships: [
          {
            foreignKeyName: "club_event_participants_club_event_id_fkey"
            columns: ["club_event_id"]
            isOneToOne: false
            referencedRelation: "club_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "club_event_participants_student_tr_fkey"
            columns: ["student_tr"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["tr_number"]
          },
        ]
      }
      club_events: {
        Row: {
          club_id: string
          created_at: string
          created_by: string | null
          description: string | null
          event_date: string | null
          event_type: Database["public"]["Enums"]["club_event_type"]
          id: string
          location: string | null
          max_participants: number | null
          title: string
        }
        Insert: {
          club_id: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          event_date?: string | null
          event_type?: Database["public"]["Enums"]["club_event_type"]
          id?: string
          location?: string | null
          max_participants?: number | null
          title: string
        }
        Update: {
          club_id?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          event_date?: string | null
          event_type?: Database["public"]["Enums"]["club_event_type"]
          id?: string
          location?: string | null
          max_participants?: number | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "club_events_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "club_events_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["tr_number"]
          },
        ]
      }
      club_members: {
        Row: {
          club_id: string
          id: string
          joined_at: string
          role: Database["public"]["Enums"]["club_member_role"]
          status: Database["public"]["Enums"]["club_member_status"]
          student_tr: string
        }
        Insert: {
          club_id: string
          id?: string
          joined_at?: string
          role?: Database["public"]["Enums"]["club_member_role"]
          status?: Database["public"]["Enums"]["club_member_status"]
          student_tr: string
        }
        Update: {
          club_id?: string
          id?: string
          joined_at?: string
          role?: Database["public"]["Enums"]["club_member_role"]
          status?: Database["public"]["Enums"]["club_member_status"]
          student_tr?: string
        }
        Relationships: [
          {
            foreignKeyName: "club_members_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "club_members_student_tr_fkey"
            columns: ["student_tr"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["tr_number"]
          },
        ]
      }
      clubs: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          incharge_id: string | null
          is_active: boolean
          name: string
          sport_id: string
          sub_incharge_id: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          incharge_id?: string | null
          is_active?: boolean
          name: string
          sport_id: string
          sub_incharge_id?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          incharge_id?: string | null
          is_active?: boolean
          name?: string
          sport_id?: string
          sub_incharge_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clubs_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["tr_number"]
          },
          {
            foreignKeyName: "clubs_incharge_id_fkey"
            columns: ["incharge_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["tr_number"]
          },
          {
            foreignKeyName: "clubs_sport_id_fkey"
            columns: ["sport_id"]
            isOneToOne: false
            referencedRelation: "sports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clubs_sub_incharge_id_fkey"
            columns: ["sub_incharge_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["tr_number"]
          },
        ]
      }
      events: {
        Row: {
          age_group: string | null
          created_at: string | null
          group_stage_desc: string | null
          id: string
          is_team_event: boolean | null
          level: Database["public"]["Enums"]["event_level"] | null
          name: string
          participation_points: number | null
          playing_lineup: number | null
          playoff_desc: string | null
          points_1st: number | null
          points_2nd: number | null
          points_3rd: number | null
          points_4th: number | null
          quota_per_house: number
          reserved_u18: number | null
          season_id: string
          sport_id: string
          sub_category: string | null
          substitutes: number | null
          top_8_points: number | null
          total_players: number | null
        }
        Insert: {
          age_group?: string | null
          created_at?: string | null
          group_stage_desc?: string | null
          id?: string
          is_team_event?: boolean | null
          level?: Database["public"]["Enums"]["event_level"] | null
          name: string
          participation_points?: number | null
          playing_lineup?: number | null
          playoff_desc?: string | null
          points_1st?: number | null
          points_2nd?: number | null
          points_3rd?: number | null
          points_4th?: number | null
          quota_per_house?: number
          reserved_u18?: number | null
          season_id: string
          sport_id: string
          sub_category?: string | null
          substitutes?: number | null
          top_8_points?: number | null
          total_players?: number | null
        }
        Update: {
          age_group?: string | null
          created_at?: string | null
          group_stage_desc?: string | null
          id?: string
          is_team_event?: boolean | null
          level?: Database["public"]["Enums"]["event_level"] | null
          name?: string
          participation_points?: number | null
          playing_lineup?: number | null
          playoff_desc?: string | null
          points_1st?: number | null
          points_2nd?: number | null
          points_3rd?: number | null
          points_4th?: number | null
          quota_per_house?: number
          reserved_u18?: number | null
          season_id?: string
          sport_id?: string
          sub_category?: string | null
          substitutes?: number | null
          top_8_points?: number | null
          total_players?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "events_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "seasons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_sport_id_fkey"
            columns: ["sport_id"]
            isOneToOne: false
            referencedRelation: "sports"
            referencedColumns: ["id"]
          },
        ]
      }
      fitness_logs: {
        Row: {
          agility: number | null
          endurance: number | null
          flexibility: number | null
          id: string
          logged_at: string | null
          speed: number | null
          strength: number | null
          student_tr: string
        }
        Insert: {
          agility?: number | null
          endurance?: number | null
          flexibility?: number | null
          id?: string
          logged_at?: string | null
          speed?: number | null
          strength?: number | null
          student_tr: string
        }
        Update: {
          agility?: number | null
          endurance?: number | null
          flexibility?: number | null
          id?: string
          logged_at?: string | null
          speed?: number | null
          strength?: number | null
          student_tr?: string
        }
        Relationships: [
          {
            foreignKeyName: "fitness_logs_student_tr_fkey"
            columns: ["student_tr"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["tr_number"]
          },
        ]
      }
      hizb: {
        Row: {
          created_at: string | null
          house_id: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          house_id: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string | null
          house_id?: string
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "hizb_house_id_fkey"
            columns: ["house_id"]
            isOneToOne: false
            referencedRelation: "houses"
            referencedColumns: ["id"]
          },
        ]
      }
      houses: {
        Row: {
          color: string
          created_at: string | null
          id: string
          name: string
        }
        Insert: {
          color: string
          created_at?: string | null
          id?: string
          name: string
        }
        Update: {
          color?: string
          created_at?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      match_request_players: {
        Row: {
          id: string
          joined_at: string
          request_id: string
          student_tr: string
        }
        Insert: {
          id?: string
          joined_at?: string
          request_id: string
          student_tr: string
        }
        Update: {
          id?: string
          joined_at?: string
          request_id?: string
          student_tr?: string
        }
        Relationships: [
          {
            foreignKeyName: "match_request_players_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "match_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_request_players_student_tr_fkey"
            columns: ["student_tr"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["tr_number"]
          },
        ]
      }
      match_requests: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          event_date: string | null
          id: string
          location: string | null
          max_players: number
          sport_id: string
          status: Database["public"]["Enums"]["match_request_status"]
          title: string
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          event_date?: string | null
          id?: string
          location?: string | null
          max_players?: number
          sport_id: string
          status?: Database["public"]["Enums"]["match_request_status"]
          title: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          event_date?: string | null
          id?: string
          location?: string | null
          max_players?: number
          sport_id?: string
          status?: Database["public"]["Enums"]["match_request_status"]
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "match_requests_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["tr_number"]
          },
          {
            foreignKeyName: "match_requests_sport_id_fkey"
            columns: ["sport_id"]
            isOneToOne: false
            referencedRelation: "sports"
            referencedColumns: ["id"]
          },
        ]
      }
      matches: {
        Row: {
          away_overs_faced: number | null
          away_runs_for: number | null
          away_score: number | null
          away_team_id: string | null
          created_at: string | null
          event_id: string
          home_overs_faced: number | null
          home_runs_for: number | null
          home_score: number | null
          home_team_id: string | null
          id: string
          match_date: string | null
          season_id: string
          stage: Database["public"]["Enums"]["match_stage"] | null
          winner_team_id: string | null
        }
        Insert: {
          away_overs_faced?: number | null
          away_runs_for?: number | null
          away_score?: number | null
          away_team_id?: string | null
          created_at?: string | null
          event_id: string
          home_overs_faced?: number | null
          home_runs_for?: number | null
          home_score?: number | null
          home_team_id?: string | null
          id?: string
          match_date?: string | null
          season_id: string
          stage?: Database["public"]["Enums"]["match_stage"] | null
          winner_team_id?: string | null
        }
        Update: {
          away_overs_faced?: number | null
          away_runs_for?: number | null
          away_score?: number | null
          away_team_id?: string | null
          created_at?: string | null
          event_id?: string
          home_overs_faced?: number | null
          home_runs_for?: number | null
          home_score?: number | null
          home_team_id?: string | null
          id?: string
          match_date?: string | null
          season_id?: string
          stage?: Database["public"]["Enums"]["match_stage"] | null
          winner_team_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "matches_away_team_id_fkey"
            columns: ["away_team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_home_team_id_fkey"
            columns: ["home_team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "seasons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_winner_team_id_fkey"
            columns: ["winner_team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      participations: {
        Row: {
          event_id: string
          hizb_id: string | null
          house_id: string
          id: string
          is_wildcard: boolean | null
          registered_at: string | null
          season_id: string
          status: Database["public"]["Enums"]["participation_status"] | null
          student_tr: string | null
          team_id: string | null
        }
        Insert: {
          event_id: string
          hizb_id?: string | null
          house_id: string
          id?: string
          is_wildcard?: boolean | null
          registered_at?: string | null
          season_id: string
          status?: Database["public"]["Enums"]["participation_status"] | null
          student_tr?: string | null
          team_id?: string | null
        }
        Update: {
          event_id?: string
          hizb_id?: string | null
          house_id?: string
          id?: string
          is_wildcard?: boolean | null
          registered_at?: string | null
          season_id?: string
          status?: Database["public"]["Enums"]["participation_status"] | null
          student_tr?: string | null
          team_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "participations_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "participations_hizb_id_fkey"
            columns: ["hizb_id"]
            isOneToOne: false
            referencedRelation: "hizb"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "participations_house_id_fkey"
            columns: ["house_id"]
            isOneToOne: false
            referencedRelation: "houses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "participations_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "seasons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "participations_student_tr_fkey"
            columns: ["student_tr"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["tr_number"]
          },
          {
            foreignKeyName: "participations_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      point_transactions: {
        Row: {
          created_at: string | null
          description: string | null
          event_id: string | null
          house_id: string
          id: string
          points: number
          season_id: string
          source: Database["public"]["Enums"]["point_source"]
          student_tr: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          event_id?: string | null
          house_id: string
          id?: string
          points: number
          season_id: string
          source: Database["public"]["Enums"]["point_source"]
          student_tr?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          event_id?: string | null
          house_id?: string
          id?: string
          points?: number
          season_id?: string
          source?: Database["public"]["Enums"]["point_source"]
          student_tr?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "point_transactions_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "point_transactions_house_id_fkey"
            columns: ["house_id"]
            isOneToOne: false
            referencedRelation: "houses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "point_transactions_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "seasons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "point_transactions_student_tr_fkey"
            columns: ["student_tr"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["tr_number"]
          },
        ]
      }
      profiles: {
        Row: {
          age_category: string | null
          avatar_url: string | null
          birth_date: string | null
          class_name: string | null
          created_at: string | null
          darajah: string | null
          edu_email: string | null
          full_name: string | null
          hizb_id: string | null
          house_id: string | null
          is_under_18: boolean | null
          its_number: string | null
          tr_number: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          age_category?: string | null
          avatar_url?: string | null
          birth_date?: string | null
          class_name?: string | null
          created_at?: string | null
          darajah?: string | null
          edu_email?: string | null
          full_name?: string | null
          hizb_id?: string | null
          house_id?: string | null
          is_under_18?: boolean | null
          its_number?: string | null
          tr_number: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          age_category?: string | null
          avatar_url?: string | null
          birth_date?: string | null
          class_name?: string | null
          created_at?: string | null
          darajah?: string | null
          edu_email?: string | null
          full_name?: string | null
          hizb_id?: string | null
          house_id?: string | null
          is_under_18?: boolean | null
          its_number?: string | null
          tr_number?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_hizb_id_fkey"
            columns: ["hizb_id"]
            isOneToOne: false
            referencedRelation: "hizb"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_house_id_fkey"
            columns: ["house_id"]
            isOneToOne: false
            referencedRelation: "houses"
            referencedColumns: ["id"]
          },
        ]
      }
      results: {
        Row: {
          created_at: string | null
          event_id: string
          id: string
          participation_id: string
          placement: number | null
          points_awarded: number | null
          season_id: string
        }
        Insert: {
          created_at?: string | null
          event_id: string
          id?: string
          participation_id: string
          placement?: number | null
          points_awarded?: number | null
          season_id: string
        }
        Update: {
          created_at?: string | null
          event_id?: string
          id?: string
          participation_id?: string
          placement?: number | null
          points_awarded?: number | null
          season_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "results_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "results_participation_id_fkey"
            columns: ["participation_id"]
            isOneToOne: false
            referencedRelation: "participations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "results_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "seasons"
            referencedColumns: ["id"]
          },
        ]
      }
      seasons: {
        Row: {
          created_at: string | null
          end_date: string | null
          id: string
          is_active: boolean | null
          name: string
          start_date: string | null
        }
        Insert: {
          created_at?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          start_date?: string | null
        }
        Update: {
          created_at?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          start_date?: string | null
        }
        Relationships: []
      }
      sport_self_assessments: {
        Row: {
          created_at: string
          experience_level: string
          id: string
          skill_rating: number
          sport_id: string
          student_tr: string
          years_of_practice: number
        }
        Insert: {
          created_at?: string
          experience_level: string
          id?: string
          skill_rating: number
          sport_id: string
          student_tr: string
          years_of_practice?: number
        }
        Update: {
          created_at?: string
          experience_level?: string
          id?: string
          skill_rating?: number
          sport_id?: string
          student_tr?: string
          years_of_practice?: number
        }
        Relationships: [
          {
            foreignKeyName: "sport_self_assessments_sport_id_fkey"
            columns: ["sport_id"]
            isOneToOne: false
            referencedRelation: "sports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sport_self_assessments_student_tr_fkey"
            columns: ["student_tr"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["tr_number"]
          },
        ]
      }
      sports: {
        Row: {
          category: string | null
          created_at: string | null
          id: string
          name: string
          sport_type: Database["public"]["Enums"]["sport_type"]
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          id?: string
          name: string
          sport_type?: Database["public"]["Enums"]["sport_type"]
        }
        Update: {
          category?: string | null
          created_at?: string | null
          id?: string
          name?: string
          sport_type?: Database["public"]["Enums"]["sport_type"]
        }
        Relationships: []
      }
      sports_interests: {
        Row: {
          confidence_level: Database["public"]["Enums"]["confidence_level"]
          created_at: string
          created_by: Database["public"]["Enums"]["interest_created_by"]
          id: string
          interest_level: Database["public"]["Enums"]["interest_level"]
          is_identified_talent: boolean
          notes: string | null
          sport_id: string
          student_tr: string
          updated_at: string
        }
        Insert: {
          confidence_level?: Database["public"]["Enums"]["confidence_level"]
          created_at?: string
          created_by?: Database["public"]["Enums"]["interest_created_by"]
          id?: string
          interest_level?: Database["public"]["Enums"]["interest_level"]
          is_identified_talent?: boolean
          notes?: string | null
          sport_id: string
          student_tr: string
          updated_at?: string
        }
        Update: {
          confidence_level?: Database["public"]["Enums"]["confidence_level"]
          created_at?: string
          created_by?: Database["public"]["Enums"]["interest_created_by"]
          id?: string
          interest_level?: Database["public"]["Enums"]["interest_level"]
          is_identified_talent?: boolean
          notes?: string | null
          sport_id?: string
          student_tr?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sports_interests_sport_id_fkey"
            columns: ["sport_id"]
            isOneToOne: false
            referencedRelation: "sports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sports_interests_student_tr_fkey"
            columns: ["student_tr"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["tr_number"]
          },
        ]
      }
      student_event_roles: {
        Row: {
          event_id: string
          id: string
          role: Database["public"]["Enums"]["event_role"]
          season_id: string
          student_tr: string
        }
        Insert: {
          event_id: string
          id?: string
          role: Database["public"]["Enums"]["event_role"]
          season_id: string
          student_tr: string
        }
        Update: {
          event_id?: string
          id?: string
          role?: Database["public"]["Enums"]["event_role"]
          season_id?: string
          student_tr?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_event_roles_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_event_roles_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "seasons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_event_roles_student_tr_fkey"
            columns: ["student_tr"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["tr_number"]
          },
        ]
      }
      student_selections: {
        Row: {
          category: string
          created_at: string | null
          created_by: string | null
          eligibility: string | null
          house_id: string
          id: string
          is_final: boolean
          is_locked: boolean
          rank: number
          season_id: string
          sport_id: string
          student_tr: string
        }
        Insert: {
          category: string
          created_at?: string | null
          created_by?: string | null
          eligibility?: string | null
          house_id: string
          id?: string
          is_final?: boolean
          is_locked?: boolean
          rank: number
          season_id: string
          sport_id: string
          student_tr: string
        }
        Update: {
          category?: string
          created_at?: string | null
          created_by?: string | null
          eligibility?: string | null
          house_id?: string
          id?: string
          is_final?: boolean
          is_locked?: boolean
          rank?: number
          season_id?: string
          sport_id?: string
          student_tr?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_selections_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["tr_number"]
          },
          {
            foreignKeyName: "student_selections_house_id_fkey"
            columns: ["house_id"]
            isOneToOne: false
            referencedRelation: "houses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_selections_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "seasons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_selections_sport_id_fkey"
            columns: ["sport_id"]
            isOneToOne: false
            referencedRelation: "sports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_selections_student_tr_fkey"
            columns: ["student_tr"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["tr_number"]
          },
        ]
      }
      student_sport_proficiencies: {
        Row: {
          created_at: string
          id: string
          level: Database["public"]["Enums"]["proficiency_level"]
          source: string
          sport_id: string
          student_tr: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          level?: Database["public"]["Enums"]["proficiency_level"]
          source?: string
          sport_id: string
          student_tr: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          level?: Database["public"]["Enums"]["proficiency_level"]
          source?: string
          sport_id?: string
          student_tr?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_sport_proficiencies_sport_id_fkey"
            columns: ["sport_id"]
            isOneToOne: false
            referencedRelation: "sports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_sport_proficiencies_student_tr_fkey"
            columns: ["student_tr"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["tr_number"]
          },
        ]
      }
      student_sport_scores: {
        Row: {
          activity_score: number
          club_score: number
          competition_score: number
          fitness_score: number
          id: string
          last_calculated: string
          proficiency_level: Database["public"]["Enums"]["proficiency_level"]
          sport_id: string
          student_tr: string
          total_score: number
        }
        Insert: {
          activity_score?: number
          club_score?: number
          competition_score?: number
          fitness_score?: number
          id?: string
          last_calculated?: string
          proficiency_level?: Database["public"]["Enums"]["proficiency_level"]
          sport_id: string
          student_tr: string
          total_score?: number
        }
        Update: {
          activity_score?: number
          club_score?: number
          competition_score?: number
          fitness_score?: number
          id?: string
          last_calculated?: string
          proficiency_level?: Database["public"]["Enums"]["proficiency_level"]
          sport_id?: string
          student_tr?: string
          total_score?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_student_sport_scores_sport"
            columns: ["sport_id"]
            isOneToOne: false
            referencedRelation: "sports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_student_sport_scores_student"
            columns: ["student_tr"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["tr_number"]
          },
        ]
      }
      team_members: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["event_role"] | null
          student_tr: string
          team_id: string
        }
        Insert: {
          id?: string
          role?: Database["public"]["Enums"]["event_role"] | null
          student_tr: string
          team_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["event_role"] | null
          student_tr?: string
          team_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_members_student_tr_fkey"
            columns: ["student_tr"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["tr_number"]
          },
          {
            foreignKeyName: "team_members_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      team_standings: {
        Row: {
          drawn: number | null
          event_id: string
          goal_diff: number | null
          goals_against: number | null
          goals_for: number | null
          id: string
          lost: number | null
          net_run_rate: number | null
          played: number | null
          points: number | null
          season_id: string
          team_id: string
          won: number | null
        }
        Insert: {
          drawn?: number | null
          event_id: string
          goal_diff?: number | null
          goals_against?: number | null
          goals_for?: number | null
          id?: string
          lost?: number | null
          net_run_rate?: number | null
          played?: number | null
          points?: number | null
          season_id: string
          team_id: string
          won?: number | null
        }
        Update: {
          drawn?: number | null
          event_id?: string
          goal_diff?: number | null
          goals_against?: number | null
          goals_for?: number | null
          id?: string
          lost?: number | null
          net_run_rate?: number | null
          played?: number | null
          points?: number | null
          season_id?: string
          team_id?: string
          won?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "team_standings_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_standings_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "seasons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_standings_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          age_group: string | null
          created_at: string | null
          event_id: string | null
          house_id: string | null
          id: string
          name: string | null
        }
        Insert: {
          age_group?: string | null
          created_at?: string | null
          event_id?: string | null
          house_id?: string | null
          id?: string
          name?: string | null
        }
        Update: {
          age_group?: string | null
          created_at?: string | null
          event_id?: string | null
          house_id?: string | null
          id?: string
          name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "teams_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teams_house_id_fkey"
            columns: ["house_id"]
            isOneToOne: false
            referencedRelation: "houses"
            referencedColumns: ["id"]
          },
        ]
      }
      training_attendance: {
        Row: {
          attended_at: string | null
          id: string
          student_tr: string
          training_id: string
        }
        Insert: {
          attended_at?: string | null
          id?: string
          student_tr: string
          training_id: string
        }
        Update: {
          attended_at?: string | null
          id?: string
          student_tr?: string
          training_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "training_attendance_student_tr_fkey"
            columns: ["student_tr"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["tr_number"]
          },
          {
            foreignKeyName: "training_attendance_training_id_fkey"
            columns: ["training_id"]
            isOneToOne: false
            referencedRelation: "trainings"
            referencedColumns: ["id"]
          },
        ]
      }
      trainings: {
        Row: {
          created_at: string | null
          event_id: string | null
          id: string
          name: string
          season_id: string | null
        }
        Insert: {
          created_at?: string | null
          event_id?: string | null
          id?: string
          name: string
          season_id?: string | null
        }
        Update: {
          created_at?: string | null
          event_id?: string | null
          id?: string
          name?: string
          season_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "trainings_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trainings_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "seasons"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      wildcard_programs: {
        Row: {
          created_at: string | null
          event_id: string
          id: string
          program_name: string | null
          quota_per_house: number | null
        }
        Insert: {
          created_at?: string | null
          event_id: string
          id?: string
          program_name?: string | null
          quota_per_house?: number | null
        }
        Update: {
          created_at?: string | null
          event_id?: string
          id?: string
          program_name?: string | null
          quota_per_house?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "wildcard_programs_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      house_leaderboard_view: {
        Row: {
          bonus_points: number | null
          house_color: string | null
          house_id: string | null
          house_name: string | null
          member_count: number | null
          participation_points: number | null
          placement_points: number | null
          season_id: string | null
          total_points: number | null
        }
        Relationships: [
          {
            foreignKeyName: "point_transactions_house_id_fkey"
            columns: ["house_id"]
            isOneToOne: false
            referencedRelation: "houses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "point_transactions_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "seasons"
            referencedColumns: ["id"]
          },
        ]
      }
      student_rankings_view: {
        Row: {
          house_id: string | null
          house_name: string | null
          participations: number | null
          placements: number | null
          season_id: string | null
          student_tr: string | null
          student_name: string | null
          total_points: number | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "point_transactions_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "seasons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "point_transactions_student_tr_fkey"
            columns: ["student_tr"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["tr_number"]
          },
          {
            foreignKeyName: "profiles_house_id_fkey"
            columns: ["house_id"]
            isOneToOne: false
            referencedRelation: "houses"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      calculate_student_sport_score: {
        Args: { p_sport_id: string; p_student_tr: string }
        Returns: undefined
      }
      generate_certificate_number: { Args: { p_year: number }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      recalculate_all_sport_scores: { Args: never; Returns: number }
    }
    Enums: {
      app_role:
        | "student"
        | "coach"
        | "admin"
        | "parent"
        | "captain"
        | "co_captain"
      certification_status: "draft" | "issued" | "revoked"
      club_event_participant_status: "registered" | "attended" | "absent"
      club_event_type: "practice" | "friendly_match" | "training" | "open_game"
      club_member_role: "member" | "incharge" | "sub_incharge"
      club_member_status: "active" | "inactive"
      confidence_level: "low" | "medium" | "high"
      event_level: "prime" | "standard"
      event_role:
        | "player"
        | "captain"
        | "coach"
        | "musaid"
        | "substitute"
        | "volunteer"
      interest_created_by: "student" | "admin" | "coach"
      interest_level:
        | "curious"
        | "beginner"
        | "learning"
        | "active"
        | "competitive"
      match_request_status: "open" | "full" | "completed"
      match_stage:
        | "group"
        | "quarterfinal"
        | "semifinal"
        | "final"
        | "third_place"
      participation_status: "registered" | "selected" | "declined" | "withdrawn"
      point_source:
        | "placement"
        | "participation"
        | "wildcard"
        | "bonus"
        | "penalty"
      proficiency_level:
        | "beginner"
        | "intermediate"
        | "advanced"
        | "expert"
        | "master"
      sport_type: "team" | "individual"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: [
        "student",
        "coach",
        "admin",
        "parent",
        "captain",
        "co_captain",
      ],
      certification_status: ["draft", "issued", "revoked"],
      club_event_participant_status: ["registered", "attended", "absent"],
      club_event_type: ["practice", "friendly_match", "training", "open_game"],
      club_member_role: ["member", "incharge", "sub_incharge"],
      club_member_status: ["active", "inactive"],
      confidence_level: ["low", "medium", "high"],
      event_level: ["prime", "standard"],
      event_role: [
        "player",
        "captain",
        "coach",
        "musaid",
        "substitute",
        "volunteer",
      ],
      interest_created_by: ["student", "admin", "coach"],
      interest_level: [
        "curious",
        "beginner",
        "learning",
        "active",
        "competitive",
      ],
      match_request_status: ["open", "full", "completed"],
      match_stage: [
        "group",
        "quarterfinal",
        "semifinal",
        "final",
        "third_place",
      ],
      participation_status: ["registered", "selected", "declined", "withdrawn"],
      point_source: [
        "placement",
        "participation",
        "wildcard",
        "bonus",
        "penalty",
      ],
      proficiency_level: [
        "beginner",
        "intermediate",
        "advanced",
        "expert",
        "master",
      ],
      sport_type: ["team", "individual"],
    },
  },
} as const
