
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  
  "public": {
          Tables: {
            "achievements": {
                  Row: {
                    "description": string,"id": string,"sort_order": number,"title": string,"xp_reward": number
                  }
                  ComputedFields: never
                  Insert: {
                    "description": string,"id": string,"sort_order"?: number,"title": string,"xp_reward"?: number
                  }
                  Update: {
                    "description"?: string,"id"?: string,"sort_order"?: number,"title"?: string,"xp_reward"?: number
                  }
                  Relationships: [
                    
                  ]
                },"course_categories": {
                  Row: {
                    "description": string,"id": string,"school_slug": string,"sort_order": number,"title": string
                  }
                  ComputedFields: never
                  Insert: {
                    "description": string,"id": string,"school_slug": string,"sort_order"?: number,"title": string
                  }
                  Update: {
                    "description"?: string,"id"?: string,"school_slug"?: string,"sort_order"?: number,"title"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "course_categories_school_slug_fkey"
      columns: ["school_slug"]
isOneToOne: false
      referencedRelation: "schools"
      referencedColumns: ["slug"]
    }
                  ]
                },"course_modules": {
                  Row: {
                    "course_id": string,"id": string,"planned_lessons": number,"sort_order": number,"title": string
                  }
                  ComputedFields: never
                  Insert: {
                    "course_id": string,"id": string,"planned_lessons"?: number,"sort_order"?: number,"title": string
                  }
                  Update: {
                    "course_id"?: string,"id"?: string,"planned_lessons"?: number,"sort_order"?: number,"title"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "course_modules_course_id_fkey"
      columns: ["course_id"]
isOneToOne: false
      referencedRelation: "courses"
      referencedColumns: ["id"]
    }
                  ]
                },"courses": {
                  Row: {
                    "category_id": string,"id": string,"level": Database["public"]['Enums']["course_level"],"sort_order": number,"status": Database["public"]['Enums']["course_status"],"summary": string,"title": string
                  }
                  ComputedFields: never
                  Insert: {
                    "category_id": string,"id": string,"level": Database["public"]['Enums']["course_level"],"sort_order"?: number,"status"?: Database["public"]['Enums']["course_status"],"summary": string,"title": string
                  }
                  Update: {
                    "category_id"?: string,"id"?: string,"level"?: Database["public"]['Enums']["course_level"],"sort_order"?: number,"status"?: Database["public"]['Enums']["course_status"],"summary"?: string,"title"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "courses_category_id_fkey"
      columns: ["category_id"]
isOneToOne: false
      referencedRelation: "course_categories"
      referencedColumns: ["id"]
    }
                  ]
                },"lesson_completions": {
                  Row: {
                    "completed_at": string,"lesson_id": string,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "completed_at"?: string,"lesson_id": string,"user_id": string
                  }
                  Update: {
                    "completed_at"?: string,"lesson_id"?: string,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "lesson_completions_lesson_id_fkey"
      columns: ["lesson_id"]
isOneToOne: false
      referencedRelation: "lessons"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "lesson_completions_user_id_fkey"
      columns: ["user_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"lessons": {
                  Row: {
                    "id": string,"module_id": string,"published": boolean,"sort_order": number,"title": string,"xp_reward": number
                  }
                  ComputedFields: never
                  Insert: {
                    "id": string,"module_id": string,"published"?: boolean,"sort_order"?: number,"title": string,"xp_reward": number
                  }
                  Update: {
                    "id"?: string,"module_id"?: string,"published"?: boolean,"sort_order"?: number,"title"?: string,"xp_reward"?: number
                  }
                  Relationships: [
                    {
      foreignKeyName: "lessons_module_id_fkey"
      columns: ["module_id"]
isOneToOne: false
      referencedRelation: "course_modules"
      referencedColumns: ["id"]
    }
                  ]
                },"profiles": {
                  Row: {
                    "created_at": string,"display_name": string,"id": string,"title": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"display_name": string,"id": string,"title"?: string
                  }
                  Update: {
                    "created_at"?: string,"display_name"?: string,"id"?: string,"title"?: string
                  }
                  Relationships: [
                    
                  ]
                },"schools": {
                  Row: {
                    "description": string,"icon": string,"name": string,"primary_attribute": Database["public"]['Enums']["attribute_key"],"short_name": string,"slug": string,"sort_order": number,"tagline": string
                  }
                  ComputedFields: never
                  Insert: {
                    "description": string,"icon": string,"name": string,"primary_attribute": Database["public"]['Enums']["attribute_key"],"short_name": string,"slug": string,"sort_order"?: number,"tagline": string
                  }
                  Update: {
                    "description"?: string,"icon"?: string,"name"?: string,"primary_attribute"?: Database["public"]['Enums']["attribute_key"],"short_name"?: string,"slug"?: string,"sort_order"?: number,"tagline"?: string
                  }
                  Relationships: [
                    
                  ]
                },"task_templates": {
                  Row: {
                    "description": string,"id": string,"kind": Database["public"]['Enums']["task_kind"],"school_slug": string | null,"sort_order": number,"target": number,"title": string,"unit": string,"xp_reward": number
                  }
                  ComputedFields: never
                  Insert: {
                    "description"?: string,"id": string,"kind": Database["public"]['Enums']["task_kind"],"school_slug"?: string | null,"sort_order"?: number,"target"?: number,"title": string,"unit"?: string,"xp_reward": number
                  }
                  Update: {
                    "description"?: string,"id"?: string,"kind"?: Database["public"]['Enums']["task_kind"],"school_slug"?: string | null,"sort_order"?: number,"target"?: number,"title"?: string,"unit"?: string,"xp_reward"?: number
                  }
                  Relationships: [
                    {
      foreignKeyName: "task_templates_school_slug_fkey"
      columns: ["school_slug"]
isOneToOne: false
      referencedRelation: "schools"
      referencedColumns: ["slug"]
    }
                  ]
                },"user_achievements": {
                  Row: {
                    "achievement_id": string,"earned_at": string,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "achievement_id": string,"earned_at"?: string,"user_id": string
                  }
                  Update: {
                    "achievement_id"?: string,"earned_at"?: string,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "user_achievements_achievement_id_fkey"
      columns: ["achievement_id"]
isOneToOne: false
      referencedRelation: "achievements"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "user_achievements_user_id_fkey"
      columns: ["user_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"user_tasks": {
                  Row: {
                    "id": string,"period_start": string,"progress": number,"status": Database["public"]['Enums']["task_status"],"template_id": string,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "id"?: string,"period_start": string,"progress"?: number,"status"?: Database["public"]['Enums']["task_status"],"template_id": string,"user_id": string
                  }
                  Update: {
                    "id"?: string,"period_start"?: string,"progress"?: number,"status"?: Database["public"]['Enums']["task_status"],"template_id"?: string,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "user_tasks_template_id_fkey"
      columns: ["template_id"]
isOneToOne: false
      referencedRelation: "task_templates"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "user_tasks_user_id_fkey"
      columns: ["user_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"xp_transactions": {
                  Row: {
                    "amount": number,"created_at": string,"description": string,"id": string,"school_slug": string | null,"source_id": string,"source_type": Database["public"]['Enums']["xp_source_type"],"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "amount": number,"created_at"?: string,"description": string,"id"?: string,"school_slug"?: string | null,"source_id": string,"source_type": Database["public"]['Enums']["xp_source_type"],"user_id": string
                  }
                  Update: {
                    "amount"?: number,"created_at"?: string,"description"?: string,"id"?: string,"school_slug"?: string | null,"source_id"?: string,"source_type"?: Database["public"]['Enums']["xp_source_type"],"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "xp_transactions_school_slug_fkey"
      columns: ["school_slug"]
isOneToOne: false
      referencedRelation: "schools"
      referencedColumns: ["slug"]
    },{
      foreignKeyName: "xp_transactions_user_id_fkey"
      columns: ["user_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                }
          }
          Views: {
            "character_xp": {
                  Row: {
                    "total_xp": number | null,"user_id": string
                  }
                  ComputedFields: never
                  Relationships: [
                    {
      foreignKeyName: "xp_transactions_user_id_fkey"
      columns: ["user_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"school_xp": {
                  Row: {
                    "school_slug": string | null,"user_id": string,"xp": number | null
                  }
                  ComputedFields: never
                  Relationships: [
                    {
      foreignKeyName: "xp_transactions_school_slug_fkey"
      columns: ["school_slug"]
isOneToOne: false
      referencedRelation: "schools"
      referencedColumns: ["slug"]
    },{
      foreignKeyName: "xp_transactions_user_id_fkey"
      columns: ["user_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                }
          }
          Functions: {
            "complete_lesson":
{ Args: { "p_lesson_id": string }; Returns: boolean
                           }
          }
          Enums: {
            "attribute_key": "wisdom"|"intellect"|"strategy"|"creativity"|"eloquence"|"discipline","course_level": "foundation"|"intermediate"|"advanced","course_status": "open"|"planned","task_kind": "daily"|"weekly","task_status": "not_started"|"in_progress"|"completed","xp_source_type": "lesson"|"course"|"mission"|"objective"|"achievement"|"adjustment"
          }
          CompositeTypes: {
            [_ in never]: never
          }
        }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

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
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
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
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
    : never = never
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
    : never = never
> = PublicCompositeTypeNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never

export const Constants = {
  "public": {
          Enums: {
            "attribute_key": ["wisdom", "intellect", "strategy", "creativity", "eloquence", "discipline"],"course_level": ["foundation", "intermediate", "advanced"],"course_status": ["open", "planned"],"task_kind": ["daily", "weekly"],"task_status": ["not_started", "in_progress", "completed"],"xp_source_type": ["lesson", "course", "mission", "objective", "achievement", "adjustment"]
          }
        }
} as const
