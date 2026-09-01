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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      activity_logs: {
        Row: {
          action: string
          actor_id: string | null
          after: Json | null
          before: Json | null
          created_at: string
          entity_id: string | null
          entity_type: string
          id: string
        }
        Insert: {
          action: string
          actor_id?: string | null
          after?: Json | null
          before?: Json | null
          created_at?: string
          entity_id?: string | null
          entity_type: string
          id?: string
        }
        Update: {
          action?: string
          actor_id?: string | null
          after?: Json | null
          before?: Json | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_logs_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      affected_areas: {
        Row: {
          campaign_id: string
          commune: string
          commune_fr: string | null
          created_at: string
          created_by: string | null
          daira: string
          daira_fr: string | null
          id: string
          lat: number | null
          lng: number | null
          notes: string | null
          severity: Database["public"]["Enums"]["affected_severity"]
          source: string | null
          spot: string | null
          spot_fr: string | null
          status_raw: string | null
          updated_at: string
          wilaya: string
          wilaya_fr: string | null
        }
        Insert: {
          campaign_id: string
          commune: string
          commune_fr?: string | null
          created_at?: string
          created_by?: string | null
          daira: string
          daira_fr?: string | null
          id?: string
          lat?: number | null
          lng?: number | null
          notes?: string | null
          severity?: Database["public"]["Enums"]["affected_severity"]
          source?: string | null
          spot?: string | null
          spot_fr?: string | null
          status_raw?: string | null
          updated_at?: string
          wilaya: string
          wilaya_fr?: string | null
        }
        Update: {
          campaign_id?: string
          commune?: string
          commune_fr?: string | null
          created_at?: string
          created_by?: string | null
          daira?: string
          daira_fr?: string | null
          id?: string
          lat?: number | null
          lng?: number | null
          notes?: string | null
          severity?: Database["public"]["Enums"]["affected_severity"]
          source?: string | null
          spot?: string | null
          spot_fr?: string | null
          status_raw?: string | null
          updated_at?: string
          wilaya?: string
          wilaya_fr?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "affected_areas_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "affected_areas_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      announcements: {
        Row: {
          campaign_id: string | null
          created_at: string
          created_by: string | null
          ends_at: string | null
          id: string
          is_active: boolean
          message: string
          sort_order: number
          starts_at: string | null
          updated_at: string
        }
        Insert: {
          campaign_id?: string | null
          created_at?: string
          created_by?: string | null
          ends_at?: string | null
          id?: string
          is_active?: boolean
          message: string
          sort_order?: number
          starts_at?: string | null
          updated_at?: string
        }
        Update: {
          campaign_id?: string | null
          created_at?: string
          created_by?: string | null
          ends_at?: string | null
          id?: string
          is_active?: boolean
          message?: string
          sort_order?: number
          starts_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "announcements_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "announcements_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      artisan_volunteers: {
        Row: {
          can_travel: boolean
          commune_id: string
          created_at: string
          full_name: string
          has_own_tools: boolean
          id: string
          notes: string | null
          phone: string
          show_phone_publicly: boolean
          specialty: string
          status: Database["public"]["Enums"]["artisan_verification_status"]
          updated_at: string
          verified_at: string | null
          verified_by: string | null
          wilaya_code: string
        }
        Insert: {
          can_travel?: boolean
          commune_id: string
          created_at?: string
          full_name: string
          has_own_tools?: boolean
          id?: string
          notes?: string | null
          phone: string
          show_phone_publicly?: boolean
          specialty: string
          status?: Database["public"]["Enums"]["artisan_verification_status"]
          updated_at?: string
          verified_at?: string | null
          verified_by?: string | null
          wilaya_code: string
        }
        Update: {
          can_travel?: boolean
          commune_id?: string
          created_at?: string
          full_name?: string
          has_own_tools?: boolean
          id?: string
          notes?: string | null
          phone?: string
          show_phone_publicly?: boolean
          specialty?: string
          status?: Database["public"]["Enums"]["artisan_verification_status"]
          updated_at?: string
          verified_at?: string | null
          verified_by?: string | null
          wilaya_code?: string
        }
        Relationships: []
      }
      beneficiary_requests: {
        Row: {
          address_note: string | null
          campaign_id: string
          children_count: number
          commune: string
          created_at: string
          created_by: string | null
          family_members_count: number
          full_name: string
          has_injuries: boolean
          housing_status: string | null
          id: string
          injuries_note: string | null
          internal_notes: string | null
          is_housing_habitable: boolean | null
          lost_income: boolean
          lost_livestock: boolean
          medical_note: string | null
          needed_categories: string[]
          needs_medical: boolean
          other_needs_note: string | null
          phone: string
          priority: Database["public"]["Enums"]["priority_level"]
          source_type: Database["public"]["Enums"]["source_type"]
          status: Database["public"]["Enums"]["request_status"]
          updated_at: string
          verification_level: Database["public"]["Enums"]["verification_level"]
          verified_at: string | null
          verified_by: string | null
          wilaya: string
        }
        Insert: {
          address_note?: string | null
          campaign_id: string
          children_count?: number
          commune: string
          created_at?: string
          created_by?: string | null
          family_members_count?: number
          full_name: string
          has_injuries?: boolean
          housing_status?: string | null
          id?: string
          injuries_note?: string | null
          internal_notes?: string | null
          is_housing_habitable?: boolean | null
          lost_income?: boolean
          lost_livestock?: boolean
          medical_note?: string | null
          needed_categories?: string[]
          needs_medical?: boolean
          other_needs_note?: string | null
          phone: string
          priority?: Database["public"]["Enums"]["priority_level"]
          source_type?: Database["public"]["Enums"]["source_type"]
          status?: Database["public"]["Enums"]["request_status"]
          updated_at?: string
          verification_level?: Database["public"]["Enums"]["verification_level"]
          verified_at?: string | null
          verified_by?: string | null
          wilaya?: string
        }
        Update: {
          address_note?: string | null
          campaign_id?: string
          children_count?: number
          commune?: string
          created_at?: string
          created_by?: string | null
          family_members_count?: number
          full_name?: string
          has_injuries?: boolean
          housing_status?: string | null
          id?: string
          injuries_note?: string | null
          internal_notes?: string | null
          is_housing_habitable?: boolean | null
          lost_income?: boolean
          lost_livestock?: boolean
          medical_note?: string | null
          needed_categories?: string[]
          needs_medical?: boolean
          other_needs_note?: string | null
          phone?: string
          priority?: Database["public"]["Enums"]["priority_level"]
          source_type?: Database["public"]["Enums"]["source_type"]
          status?: Database["public"]["Enums"]["request_status"]
          updated_at?: string
          verification_level?: Database["public"]["Enums"]["verification_level"]
          verified_at?: string | null
          verified_by?: string | null
          wilaya?: string
        }
        Relationships: [
          {
            foreignKeyName: "beneficiary_requests_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "beneficiary_requests_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "beneficiary_requests_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      campaigns: {
        Row: {
          created_at: string
          description: string | null
          disaster_type: string
          id: string
          is_active: boolean
          name: string
          region_wilaya: string | null
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          disaster_type?: string
          id?: string
          is_active?: boolean
          name: string
          region_wilaya?: string | null
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          disaster_type?: string
          id?: string
          is_active?: boolean
          name?: string
          region_wilaya?: string | null
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string
          default_unit: Database["public"]["Enums"]["unit_type"]
          id: string
          name_ar: string
          slug: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          default_unit?: Database["public"]["Enums"]["unit_type"]
          id?: string
          name_ar: string
          slug: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          default_unit?: Database["public"]["Enums"]["unit_type"]
          id?: string
          name_ar?: string
          slug?: string
          sort_order?: number
        }
        Relationships: []
      }
      collection_points: {
        Row: {
          accepted_categories: string[]
          address: string | null
          campaign_id: string
          capacity_note: string | null
          commune: string
          contact_name: string | null
          created_at: string
          created_by: string | null
          id: string
          lat: number | null
          lng: number | null
          name: string
          notes: string | null
          opening_hours: string | null
          phone: string | null
          show_phone_publicly: boolean
          status: Database["public"]["Enums"]["point_status"]
          updated_at: string
          verification_level: Database["public"]["Enums"]["verification_level"]
          verified_at: string | null
          verified_by: string | null
          wilaya: string
        }
        Insert: {
          accepted_categories?: string[]
          address?: string | null
          campaign_id: string
          capacity_note?: string | null
          commune: string
          contact_name?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          lat?: number | null
          lng?: number | null
          name: string
          notes?: string | null
          opening_hours?: string | null
          phone?: string | null
          show_phone_publicly?: boolean
          status?: Database["public"]["Enums"]["point_status"]
          updated_at?: string
          verification_level?: Database["public"]["Enums"]["verification_level"]
          verified_at?: string | null
          verified_by?: string | null
          wilaya: string
        }
        Update: {
          accepted_categories?: string[]
          address?: string | null
          campaign_id?: string
          capacity_note?: string | null
          commune?: string
          contact_name?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          lat?: number | null
          lng?: number | null
          name?: string
          notes?: string | null
          opening_hours?: string | null
          phone?: string | null
          show_phone_publicly?: boolean
          status?: Database["public"]["Enums"]["point_status"]
          updated_at?: string
          verification_level?: Database["public"]["Enums"]["verification_level"]
          verified_at?: string | null
          verified_by?: string | null
          wilaya?: string
        }
        Relationships: [
          {
            foreignKeyName: "collection_points_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collection_points_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collection_points_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      damage_assessments: {
        Row: {
          address_note: string | null
          assigned_artisan_id: string | null
          beneficiary_request_id: string | null
          commune: string
          created_at: string
          estimated_paint_cans: number | null
          estimated_paint_liters: number | null
          finishing_notes: string | null
          full_name: string
          id: string
          linked_need_id: string | null
          needs_electrical: boolean
          needs_flooring: boolean
          needs_paint: boolean
          needs_plumbing: boolean
          needs_roofing: boolean
          paint_area_sqm: number | null
          phone: string
          photo_paths: string[]
          required_specialties: string[]
          status: Database["public"]["Enums"]["damage_assessment_status"]
          updated_at: string
          verified_at: string | null
          verified_by: string | null
          wilaya: string
        }
        Insert: {
          address_note?: string | null
          assigned_artisan_id?: string | null
          beneficiary_request_id?: string | null
          commune: string
          created_at?: string
          estimated_paint_cans?: number | null
          estimated_paint_liters?: number | null
          finishing_notes?: string | null
          full_name: string
          id?: string
          linked_need_id?: string | null
          needs_electrical?: boolean
          needs_flooring?: boolean
          needs_paint?: boolean
          needs_plumbing?: boolean
          needs_roofing?: boolean
          paint_area_sqm?: number | null
          phone: string
          photo_paths?: string[]
          required_specialties?: string[]
          status?: Database["public"]["Enums"]["damage_assessment_status"]
          updated_at?: string
          verified_at?: string | null
          verified_by?: string | null
          wilaya: string
        }
        Update: {
          address_note?: string | null
          assigned_artisan_id?: string | null
          beneficiary_request_id?: string | null
          commune?: string
          created_at?: string
          estimated_paint_cans?: number | null
          estimated_paint_liters?: number | null
          finishing_notes?: string | null
          full_name?: string
          id?: string
          linked_need_id?: string | null
          needs_electrical?: boolean
          needs_flooring?: boolean
          needs_paint?: boolean
          needs_plumbing?: boolean
          needs_roofing?: boolean
          paint_area_sqm?: number | null
          phone?: string
          photo_paths?: string[]
          required_specialties?: string[]
          status?: Database["public"]["Enums"]["damage_assessment_status"]
          updated_at?: string
          verified_at?: string | null
          verified_by?: string | null
          wilaya?: string
        }
        Relationships: [
          {
            foreignKeyName: "damage_assessments_assigned_artisan_id_fkey"
            columns: ["assigned_artisan_id"]
            isOneToOne: false
            referencedRelation: "artisan_volunteers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "damage_assessments_beneficiary_request_id_fkey"
            columns: ["beneficiary_request_id"]
            isOneToOne: false
            referencedRelation: "beneficiary_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "damage_assessments_linked_need_id_fkey"
            columns: ["linked_need_id"]
            isOneToOne: false
            referencedRelation: "needs"
            referencedColumns: ["id"]
          },
        ]
      }
      distributions: {
        Row: {
          beneficiary_family_count: number
          campaign_id: string
          category_id: string
          created_at: string
          distribution_date: string
          hub_id: string
          id: string
          notes: string | null
          proof_file_path: string | null
          quantity: number
          responsible_id: string | null
          responsible_name: string
          unit: Database["public"]["Enums"]["unit_type"]
          updated_at: string
        }
        Insert: {
          beneficiary_family_count?: number
          campaign_id: string
          category_id: string
          created_at?: string
          distribution_date?: string
          hub_id: string
          id?: string
          notes?: string | null
          proof_file_path?: string | null
          quantity: number
          responsible_id?: string | null
          responsible_name: string
          unit?: Database["public"]["Enums"]["unit_type"]
          updated_at?: string
        }
        Update: {
          beneficiary_family_count?: number
          campaign_id?: string
          category_id?: string
          created_at?: string
          distribution_date?: string
          hub_id?: string
          id?: string
          notes?: string | null
          proof_file_path?: string | null
          quantity?: number
          responsible_id?: string | null
          responsible_name?: string
          unit?: Database["public"]["Enums"]["unit_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "distributions_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "distributions_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "distributions_hub_id_fkey"
            columns: ["hub_id"]
            isOneToOne: false
            referencedRelation: "relief_hubs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "distributions_responsible_id_fkey"
            columns: ["responsible_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      donation_items: {
        Row: {
          category_id: string
          created_at: string
          description: string | null
          donation_id: string
          id: string
          quantity: number
          unit: Database["public"]["Enums"]["unit_type"]
        }
        Insert: {
          category_id: string
          created_at?: string
          description?: string | null
          donation_id: string
          id?: string
          quantity: number
          unit?: Database["public"]["Enums"]["unit_type"]
        }
        Update: {
          category_id?: string
          created_at?: string
          description?: string | null
          donation_id?: string
          id?: string
          quantity?: number
          unit?: Database["public"]["Enums"]["unit_type"]
        }
        Relationships: [
          {
            foreignKeyName: "donation_items_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "donation_items_donation_id_fkey"
            columns: ["donation_id"]
            isOneToOne: false
            referencedRelation: "donations"
            referencedColumns: ["id"]
          },
        ]
      }
      donations: {
        Row: {
          campaign_id: string
          can_deliver_self: boolean
          created_at: string
          current_commune: string | null
          current_wilaya: string
          donor_id: string | null
          donor_name: string
          donor_phone: string
          id: string
          needs_transport: boolean
          notes: string | null
          ready_at: string | null
          status: Database["public"]["Enums"]["donation_status"]
          suggested_collection_point_id: string | null
          updated_at: string
        }
        Insert: {
          campaign_id: string
          can_deliver_self?: boolean
          created_at?: string
          current_commune?: string | null
          current_wilaya: string
          donor_id?: string | null
          donor_name: string
          donor_phone: string
          id?: string
          needs_transport?: boolean
          notes?: string | null
          ready_at?: string | null
          status?: Database["public"]["Enums"]["donation_status"]
          suggested_collection_point_id?: string | null
          updated_at?: string
        }
        Update: {
          campaign_id?: string
          can_deliver_self?: boolean
          created_at?: string
          current_commune?: string | null
          current_wilaya?: string
          donor_id?: string | null
          donor_name?: string
          donor_phone?: string
          id?: string
          needs_transport?: boolean
          notes?: string | null
          ready_at?: string | null
          status?: Database["public"]["Enums"]["donation_status"]
          suggested_collection_point_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "donations_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "donations_donor_id_fkey"
            columns: ["donor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "donations_suggested_collection_point_id_fkey"
            columns: ["suggested_collection_point_id"]
            isOneToOne: false
            referencedRelation: "collection_points"
            referencedColumns: ["id"]
          },
        ]
      }
      field_volunteers: {
        Row: {
          availability: string
          commune_id: string
          created_at: string
          emergency_contact: string | null
          equipment: string[]
          full_name: string
          id: string
          mobility: string
          notes: string | null
          phone: string
          show_phone_publicly: boolean
          skills: string[]
          status: Database["public"]["Enums"]["field_volunteer_status"]
          updated_at: string
          verified_at: string | null
          verified_by: string | null
          wilaya_code: string
        }
        Insert: {
          availability?: string
          commune_id: string
          created_at?: string
          emergency_contact?: string | null
          equipment?: string[]
          full_name: string
          id?: string
          mobility?: string
          notes?: string | null
          phone: string
          show_phone_publicly?: boolean
          skills?: string[]
          status?: Database["public"]["Enums"]["field_volunteer_status"]
          updated_at?: string
          verified_at?: string | null
          verified_by?: string | null
          wilaya_code: string
        }
        Update: {
          availability?: string
          commune_id?: string
          created_at?: string
          emergency_contact?: string | null
          equipment?: string[]
          full_name?: string
          id?: string
          mobility?: string
          notes?: string | null
          phone?: string
          show_phone_publicly?: boolean
          skills?: string[]
          status?: Database["public"]["Enums"]["field_volunteer_status"]
          updated_at?: string
          verified_at?: string | null
          verified_by?: string | null
          wilaya_code?: string
        }
        Relationships: [
          {
            foreignKeyName: "field_volunteers_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      emergency_sos: {
        Row: {
          created_at: string
          full_name: string | null
          id: string
          latitude: number
          longitude: number
          phone: string
        }
        Insert: {
          created_at?: string
          full_name?: string | null
          id?: string
          latitude: number
          longitude: number
          phone: string
        }
        Update: {
          created_at?: string
          full_name?: string | null
          id?: string
          latitude?: number
          longitude?: number
          phone?: string
        }
        Relationships: []
      }
      inventory_items: {
        Row: {
          category_id: string
          hub_id: string
          id: string
          min_threshold: number
          quantity: number
          unit: Database["public"]["Enums"]["unit_type"]
          updated_at: string
        }
        Insert: {
          category_id: string
          hub_id: string
          id?: string
          min_threshold?: number
          quantity?: number
          unit?: Database["public"]["Enums"]["unit_type"]
          updated_at?: string
        }
        Update: {
          category_id?: string
          hub_id?: string
          id?: string
          min_threshold?: number
          quantity?: number
          unit?: Database["public"]["Enums"]["unit_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_items_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_items_hub_id_fkey"
            columns: ["hub_id"]
            isOneToOne: false
            referencedRelation: "relief_hubs"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_transactions: {
        Row: {
          category_id: string
          created_at: string
          destination_hub_id: string | null
          hub_id: string
          id: string
          note: string | null
          performed_by: string | null
          quantity: number
          related_distribution_id: string | null
          related_donation_id: string | null
          source_hub_id: string | null
          type: Database["public"]["Enums"]["inventory_txn_type"]
          unit: Database["public"]["Enums"]["unit_type"]
        }
        Insert: {
          category_id: string
          created_at?: string
          destination_hub_id?: string | null
          hub_id: string
          id?: string
          note?: string | null
          performed_by?: string | null
          quantity: number
          related_distribution_id?: string | null
          related_donation_id?: string | null
          source_hub_id?: string | null
          type: Database["public"]["Enums"]["inventory_txn_type"]
          unit?: Database["public"]["Enums"]["unit_type"]
        }
        Update: {
          category_id?: string
          created_at?: string
          destination_hub_id?: string | null
          hub_id?: string
          id?: string
          note?: string | null
          performed_by?: string | null
          quantity?: number
          related_distribution_id?: string | null
          related_donation_id?: string | null
          source_hub_id?: string | null
          type?: Database["public"]["Enums"]["inventory_txn_type"]
          unit?: Database["public"]["Enums"]["unit_type"]
        }
        Relationships: [
          {
            foreignKeyName: "inventory_transactions_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_transactions_destination_hub_id_fkey"
            columns: ["destination_hub_id"]
            isOneToOne: false
            referencedRelation: "relief_hubs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_transactions_hub_id_fkey"
            columns: ["hub_id"]
            isOneToOne: false
            referencedRelation: "relief_hubs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_transactions_performed_by_fkey"
            columns: ["performed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_transactions_source_hub_id_fkey"
            columns: ["source_hub_id"]
            isOneToOne: false
            referencedRelation: "relief_hubs"
            referencedColumns: ["id"]
          },
        ]
      }
      locations: {
        Row: {
          commune_name: string | null
          created_at: string
          id: string
          lat: number | null
          lng: number | null
          wilaya_code: string
          wilaya_name: string
        }
        Insert: {
          commune_name?: string | null
          created_at?: string
          id?: string
          lat?: number | null
          lng?: number | null
          wilaya_code: string
          wilaya_name: string
        }
        Update: {
          commune_name?: string | null
          created_at?: string
          id?: string
          lat?: number | null
          lng?: number | null
          wilaya_code?: string
          wilaya_name?: string
        }
        Relationships: []
      }
      medical_volunteers: {
        Row: {
          can_field_intervene: boolean
          can_teleconsult: boolean
          commune_id: string
          created_at: string
          current_workplace: string | null
          email: string | null
          full_name: string
          has_emergency_kit: boolean
          id: string
          license_number: string | null
          notes: string | null
          phone: string
          show_phone_publicly: boolean
          specialty: string
          status: Database["public"]["Enums"]["medical_verification_status"]
          updated_at: string
          verified_at: string | null
          verified_by: string | null
          wilaya_code: string
        }
        Insert: {
          can_field_intervene?: boolean
          can_teleconsult?: boolean
          commune_id: string
          created_at?: string
          current_workplace?: string | null
          email?: string | null
          full_name: string
          has_emergency_kit?: boolean
          id?: string
          license_number?: string | null
          notes?: string | null
          phone: string
          show_phone_publicly?: boolean
          specialty: string
          status?: Database["public"]["Enums"]["medical_verification_status"]
          updated_at?: string
          verified_at?: string | null
          verified_by?: string | null
          wilaya_code: string
        }
        Update: {
          can_field_intervene?: boolean
          can_teleconsult?: boolean
          commune_id?: string
          created_at?: string
          current_workplace?: string | null
          email?: string | null
          full_name?: string
          has_emergency_kit?: boolean
          id?: string
          license_number?: string | null
          notes?: string | null
          phone?: string
          show_phone_publicly?: boolean
          specialty?: string
          status?: Database["public"]["Enums"]["medical_verification_status"]
          updated_at?: string
          verified_at?: string | null
          verified_by?: string | null
          wilaya_code?: string
        }
        Relationships: [
          {
            foreignKeyName: "medical_volunteers_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      needs: {
        Row: {
          campaign_id: string
          category_id: string
          collection_point_id: string | null
          commune: string
          created_at: string
          created_by: string | null
          expires_at: string | null
          hub_id: string | null
          id: string
          is_auto_generated: boolean
          notes: string | null
          priority: Database["public"]["Enums"]["priority_level"]
          quantity_available: number
          quantity_needed: number
          source_type: Database["public"]["Enums"]["source_type"]
          status: Database["public"]["Enums"]["need_status"]
          title: string | null
          unit: Database["public"]["Enums"]["unit_type"]
          updated_at: string
          verification_level: Database["public"]["Enums"]["verification_level"]
          verified_at: string | null
          verified_by: string | null
          wilaya: string
        }
        Insert: {
          campaign_id: string
          category_id: string
          collection_point_id?: string | null
          commune: string
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
          hub_id?: string | null
          id?: string
          is_auto_generated?: boolean
          notes?: string | null
          priority?: Database["public"]["Enums"]["priority_level"]
          quantity_available?: number
          quantity_needed?: number
          source_type?: Database["public"]["Enums"]["source_type"]
          status?: Database["public"]["Enums"]["need_status"]
          title?: string | null
          unit?: Database["public"]["Enums"]["unit_type"]
          updated_at?: string
          verification_level?: Database["public"]["Enums"]["verification_level"]
          verified_at?: string | null
          verified_by?: string | null
          wilaya: string
        }
        Update: {
          campaign_id?: string
          category_id?: string
          collection_point_id?: string | null
          commune?: string
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
          hub_id?: string | null
          id?: string
          is_auto_generated?: boolean
          notes?: string | null
          priority?: Database["public"]["Enums"]["priority_level"]
          quantity_available?: number
          quantity_needed?: number
          source_type?: Database["public"]["Enums"]["source_type"]
          status?: Database["public"]["Enums"]["need_status"]
          title?: string | null
          unit?: Database["public"]["Enums"]["unit_type"]
          updated_at?: string
          verification_level?: Database["public"]["Enums"]["verification_level"]
          verified_at?: string | null
          verified_by?: string | null
          wilaya?: string
        }
        Relationships: [
          {
            foreignKeyName: "needs_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "needs_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "needs_collection_point_id_fkey"
            columns: ["collection_point_id"]
            isOneToOne: false
            referencedRelation: "collection_points"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "needs_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "needs_hub_id_fkey"
            columns: ["hub_id"]
            isOneToOne: false
            referencedRelation: "relief_hubs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "needs_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          id: string
          is_read: boolean
          link: string | null
          profile_id: string
          title: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string | null
          profile_id: string
          title: string
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string | null
          profile_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      official_updates: {
        Row: {
          authority: string | null
          body: string | null
          campaign_id: string
          created_at: string
          created_by: string | null
          external_id: string | null
          id: string
          is_urgent: boolean
          published_at: string
          source: string
          title: string
          update_type: string
          url: string | null
          wilaya: string | null
        }
        Insert: {
          authority?: string | null
          body?: string | null
          campaign_id: string
          created_at?: string
          created_by?: string | null
          external_id?: string | null
          id?: string
          is_urgent?: boolean
          published_at?: string
          source: string
          title: string
          update_type?: string
          url?: string | null
          wilaya?: string | null
        }
        Update: {
          authority?: string | null
          body?: string | null
          campaign_id?: string
          created_at?: string
          created_by?: string | null
          external_id?: string | null
          id?: string
          is_urgent?: boolean
          published_at?: string
          source?: string
          title?: string
          update_type?: string
          url?: string | null
          wilaya?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "official_updates_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "official_updates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          contact_name: string | null
          created_at: string
          created_by: string | null
          id: string
          name: string
          org_type: string | null
          phone: string | null
          updated_at: string
          verification_level: Database["public"]["Enums"]["verification_level"]
          verified_at: string | null
          verified_by: string | null
          wilaya: string | null
        }
        Insert: {
          contact_name?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          name: string
          org_type?: string | null
          phone?: string | null
          updated_at?: string
          verification_level?: Database["public"]["Enums"]["verification_level"]
          verified_at?: string | null
          verified_by?: string | null
          wilaya?: string | null
        }
        Update: {
          contact_name?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          name?: string
          org_type?: string | null
          phone?: string | null
          updated_at?: string
          verification_level?: Database["public"]["Enums"]["verification_level"]
          verified_at?: string | null
          verified_by?: string | null
          wilaya?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organizations_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organizations_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          author_id: string | null
          author_name: string | null
          body: string
          campaign_id: string | null
          created_at: string
          excerpt: string | null
          id: string
          is_published: boolean
          published_at: string | null
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          author_id?: string | null
          author_name?: string | null
          body: string
          campaign_id?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          is_published?: boolean
          published_at?: string | null
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string | null
          author_name?: string | null
          body?: string
          campaign_id?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          is_published?: boolean
          published_at?: string | null
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "posts_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string | null
          id: string
          organization_id: string | null
          phone: string | null
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
          wilaya: string | null
        }
        Insert: {
          created_at?: string
          full_name?: string | null
          id: string
          organization_id?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          wilaya?: string | null
        }
        Update: {
          created_at?: string
          full_name?: string | null
          id?: string
          organization_id?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          wilaya?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_organization_fk"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      relief_hubs: {
        Row: {
          address: string | null
          campaign_id: string
          capacity_note: string | null
          commune: string
          contact_name: string | null
          created_at: string
          created_by: string | null
          id: string
          is_shelter: boolean
          lat: number | null
          lng: number | null
          name: string
          notes: string | null
          opening_hours: string | null
          phone: string | null
          show_phone_publicly: boolean
          status: Database["public"]["Enums"]["point_status"]
          updated_at: string
          verification_level: Database["public"]["Enums"]["verification_level"]
          verified_at: string | null
          verified_by: string | null
          wilaya: string
        }
        Insert: {
          address?: string | null
          campaign_id: string
          capacity_note?: string | null
          commune: string
          contact_name?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          is_shelter?: boolean
          lat?: number | null
          lng?: number | null
          name: string
          notes?: string | null
          opening_hours?: string | null
          phone?: string | null
          show_phone_publicly?: boolean
          status?: Database["public"]["Enums"]["point_status"]
          updated_at?: string
          verification_level?: Database["public"]["Enums"]["verification_level"]
          verified_at?: string | null
          verified_by?: string | null
          wilaya: string
        }
        Update: {
          address?: string | null
          campaign_id?: string
          capacity_note?: string | null
          commune?: string
          contact_name?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          is_shelter?: boolean
          lat?: number | null
          lng?: number | null
          name?: string
          notes?: string | null
          opening_hours?: string | null
          phone?: string | null
          show_phone_publicly?: boolean
          status?: Database["public"]["Enums"]["point_status"]
          updated_at?: string
          verification_level?: Database["public"]["Enums"]["verification_level"]
          verified_at?: string | null
          verified_by?: string | null
          wilaya?: string
        }
        Relationships: [
          {
            foreignKeyName: "relief_hubs_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "relief_hubs_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "relief_hubs_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      transport_offers: {
        Row: {
          available_space_note: string | null
          campaign_id: string
          created_at: string
          destination_note: string | null
          destination_wilaya: string
          driver_id: string | null
          driver_name: string
          has_empty_space: boolean
          id: string
          max_capacity_kg: number | null
          notes: string | null
          origin_note: string | null
          origin_wilaya: string
          phone: string
          status: Database["public"]["Enums"]["transport_status"]
          time_window: string | null
          travel_date: string | null
          updated_at: string
          vehicle_type: Database["public"]["Enums"]["vehicle_type"]
        }
        Insert: {
          available_space_note?: string | null
          campaign_id: string
          created_at?: string
          destination_note?: string | null
          destination_wilaya?: string
          driver_id?: string | null
          driver_name: string
          has_empty_space?: boolean
          id?: string
          max_capacity_kg?: number | null
          notes?: string | null
          origin_note?: string | null
          origin_wilaya: string
          phone: string
          status?: Database["public"]["Enums"]["transport_status"]
          time_window?: string | null
          travel_date?: string | null
          updated_at?: string
          vehicle_type: Database["public"]["Enums"]["vehicle_type"]
        }
        Update: {
          available_space_note?: string | null
          campaign_id?: string
          created_at?: string
          destination_note?: string | null
          destination_wilaya?: string
          driver_id?: string | null
          driver_name?: string
          has_empty_space?: boolean
          id?: string
          max_capacity_kg?: number | null
          notes?: string | null
          origin_note?: string | null
          origin_wilaya?: string
          phone?: string
          status?: Database["public"]["Enums"]["transport_status"]
          time_window?: string | null
          travel_date?: string | null
          updated_at?: string
          vehicle_type?: Database["public"]["Enums"]["vehicle_type"]
        }
        Relationships: [
          {
            foreignKeyName: "transport_offers_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transport_offers_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      transport_requests: {
        Row: {
          category_id: string | null
          created_at: string
          donation_id: string | null
          from_wilaya: string
          id: string
          need_id: string | null
          notes: string | null
          quantity: number | null
          status: Database["public"]["Enums"]["transport_status"]
          to_wilaya: string
          transport_offer_id: string | null
          unit: Database["public"]["Enums"]["unit_type"] | null
          updated_at: string
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          donation_id?: string | null
          from_wilaya: string
          id?: string
          need_id?: string | null
          notes?: string | null
          quantity?: number | null
          status?: Database["public"]["Enums"]["transport_status"]
          to_wilaya: string
          transport_offer_id?: string | null
          unit?: Database["public"]["Enums"]["unit_type"] | null
          updated_at?: string
        }
        Update: {
          category_id?: string | null
          created_at?: string
          donation_id?: string | null
          from_wilaya?: string
          id?: string
          need_id?: string | null
          notes?: string | null
          quantity?: number | null
          status?: Database["public"]["Enums"]["transport_status"]
          to_wilaya?: string
          transport_offer_id?: string | null
          unit?: Database["public"]["Enums"]["unit_type"] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "transport_requests_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transport_requests_donation_id_fkey"
            columns: ["donation_id"]
            isOneToOne: false
            referencedRelation: "donations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transport_requests_need_id_fkey"
            columns: ["need_id"]
            isOneToOne: false
            referencedRelation: "needs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transport_requests_transport_offer_id_fkey"
            columns: ["transport_offer_id"]
            isOneToOne: false
            referencedRelation: "transport_offers"
            referencedColumns: ["id"]
          },
        ]
      }
      verification_records: {
        Row: {
          created_at: string
          entity_id: string
          entity_type: string
          id: string
          level: Database["public"]["Enums"]["verification_level"]
          note: string | null
          verified_by: string | null
        }
        Insert: {
          created_at?: string
          entity_id: string
          entity_type: string
          id?: string
          level: Database["public"]["Enums"]["verification_level"]
          note?: string | null
          verified_by?: string | null
        }
        Update: {
          created_at?: string
          entity_id?: string
          entity_type?: string
          id?: string
          level?: Database["public"]["Enums"]["verification_level"]
          note?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "verification_records_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_public_artisan_volunteers: {
        Args: never
        Returns: {
          can_travel: boolean
          commune_id: string
          full_name: string
          has_own_tools: boolean
          id: string
          phone: string
          specialty: string
          wilaya_code: string
        }[]
      }
      get_public_collection_points: {
        Args: never
        Returns: {
          accepted_categories: string[]
          address: string
          campaign_id: string
          capacity_note: string
          commune: string
          contact_name: string
          created_at: string
          id: string
          lat: number
          lng: number
          name: string
          notes: string
          opening_hours: string
          phone: string
          status: Database["public"]["Enums"]["point_status"]
          updated_at: string
          verification_level: Database["public"]["Enums"]["verification_level"]
          wilaya: string
        }[]
      }
      get_public_medical_volunteers: {
        Args: never
        Returns: {
          can_field_intervene: boolean
          can_teleconsult: boolean
          commune_id: string
          current_workplace: string
          full_name: string
          id: string
          phone: string
          specialty: string
          wilaya_code: string
        }[]
      }
      get_public_relief_hubs: {
        Args: never
        Returns: {
          address: string
          campaign_id: string
          capacity_note: string
          commune: string
          contact_name: string
          created_at: string
          id: string
          is_shelter: boolean
          lat: number
          lng: number
          name: string
          notes: string
          opening_hours: string
          phone: string
          status: Database["public"]["Enums"]["point_status"]
          updated_at: string
          verification_level: Database["public"]["Enums"]["verification_level"]
          wilaya: string
        }[]
      }
      get_public_transport_candidates: {
        Args: never
        Returns: {
          current_commune: string
          current_wilaya: string
          donation_id: string
          items_summary: string
        }[]
      }
      get_stat_distributions_by_category: {
        Args: never
        Returns: {
          name_ar: string
          slug: string
          total_families: number
          total_quantity: number
          unit: Database["public"]["Enums"]["unit_type"]
        }[]
      }
      get_stat_donations_by_category: {
        Args: never
        Returns: {
          donation_count: number
          name_ar: string
          slug: string
          total_quantity: number
          unit: Database["public"]["Enums"]["unit_type"]
        }[]
      }
      get_stat_overview: {
        Args: never
        Returns: {
          active_points: number
          active_shipments: number
          areas_reached: number
          critical_needs: number
          families_awaiting: number
          total_families: number
        }[]
      }
      count_needs_by_priority: {
        Args: never
        Returns: {
          priority: string
          count: number
        }[]
      }
      is_admin: { Args: never; Returns: boolean }
      is_manager: { Args: never; Returns: boolean }
      is_staff: { Args: never; Returns: boolean }
      notify_managers: {
        Args: { p_body: string; p_link: string; p_title: string }
        Returns: undefined
      }
    }
    Enums: {
      affected_severity:
        | "ravaged"
        | "evacuated"
        | "threatened"
        | "burning"
        | "unconfirmed"
      app_role:
        | "admin"
        | "coordinator"
        | "volunteer"
        | "verified_organization"
        | "donor"
        | "driver"
        | "beneficiary"
      artisan_verification_status: "pending" | "verified" | "rejected"
      damage_assessment_status:
        | "pending"
        | "estimated"
        | "matched"
        | "in_progress"
        | "completed"
        | "rejected"
      donation_status: "registered" | "matched" | "delivered" | "cancelled"
      field_volunteer_status: "pending" | "verified" | "deployed" | "inactive"
      inventory_txn_type: "in" | "out" | "adjustment" | "transfer"
      medical_verification_status: "pending" | "verified" | "rejected"
      need_status: "active" | "resolved" | "expired"
      point_status: "open" | "full" | "paused" | "closed"
      priority_level: "critical" | "high" | "medium" | "low"
      request_status:
        | "pending"
        | "under_review"
        | "verified"
        | "partially_helped"
        | "helped"
        | "closed"
        | "rejected"
      source_type:
        | "field_team"
        | "organization"
        | "municipality"
        | "official"
        | "volunteer"
        | "public_report"
      transport_status:
        | "requested"
        | "matched"
        | "confirmed"
        | "in_transit"
        | "delivered"
        | "cancelled"
      unit_type:
        | "piece"
        | "box"
        | "portion"
        | "carton"
        | "liter"
        | "kg"
        | "ton"
        | "bundle"
        | "person"
      vehicle_type:
        | "car"
        | "van"
        | "small_truck"
        | "medium_truck"
        | "large_truck"
        | "trailer"
      verification_level:
        | "unverified"
        | "pending"
        | "verified"
        | "field_verified"
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
      affected_severity: [
        "ravaged",
        "evacuated",
        "threatened",
        "burning",
        "unconfirmed",
      ],
      app_role: [
        "admin",
        "coordinator",
        "volunteer",
        "verified_organization",
        "donor",
        "driver",
        "beneficiary",
      ],
      artisan_verification_status: ["pending", "verified", "rejected"],
      damage_assessment_status: [
        "pending",
        "estimated",
        "matched",
        "in_progress",
        "completed",
        "rejected",
      ],
      donation_status: ["registered", "matched", "delivered", "cancelled"],
      field_volunteer_status: ["pending", "verified", "deployed", "inactive"],
      inventory_txn_type: ["in", "out", "adjustment", "transfer"],
      medical_verification_status: ["pending", "verified", "rejected"],
      need_status: ["active", "resolved", "expired"],
      point_status: ["open", "full", "paused", "closed"],
      priority_level: ["critical", "high", "medium", "low"],
      request_status: [
        "pending",
        "under_review",
        "verified",
        "partially_helped",
        "helped",
        "closed",
        "rejected",
      ],
      source_type: [
        "field_team",
        "organization",
        "municipality",
        "official",
        "volunteer",
        "public_report",
      ],
      transport_status: [
        "requested",
        "matched",
        "confirmed",
        "in_transit",
        "delivered",
        "cancelled",
      ],
      unit_type: [
        "piece",
        "box",
        "portion",
        "carton",
        "liter",
        "kg",
        "ton",
        "bundle",
        "person",
      ],
      vehicle_type: [
        "car",
        "van",
        "small_truck",
        "medium_truck",
        "large_truck",
        "trailer",
      ],
      verification_level: [
        "unverified",
        "pending",
        "verified",
        "field_verified",
      ],
    },
  },
} as const
