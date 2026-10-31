export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      categories: {
        Row: {
          color: string;
          icon: string;
          id: string;
          name: string;
          user_id: string;
        };
        ComputedFields: never;
        Insert: {
          color?: string;
          icon?: string;
          id: string;
          name: string;
          user_id: string;
        };
        Update: {
          color?: string;
          icon?: string;
          id?: string;
          name?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      device_profiles: {
        Row: {
          avatar: string | null;
          custom_name: string | null;
          device_id: string;
          photo_updated_at: string | null;
          user_id: string;
        };
        ComputedFields: never;
        Insert: {
          avatar?: string | null;
          custom_name?: string | null;
          device_id: string;
          photo_updated_at?: string | null;
          user_id: string;
        };
        Update: {
          avatar?: string | null;
          custom_name?: string | null;
          device_id?: string;
          photo_updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [];
      };
      expenses: {
        Row: {
          amount: number;
          category_id: string | null;
          date: string;
          device_browser: string | null;
          device_id: string | null;
          device_model: string | null;
          device_name: string | null;
          device_os: string | null;
          device_screen: string | null;
          device_type: string | null;
          id: string;
          is_bill: boolean;
          merchant: string;
          occurrence_date: string | null;
          payment_method: string;
          recurring_id: string | null;
          source: string;
          user_id: string;
        };
        ComputedFields: never;
        Insert: {
          amount?: number;
          category_id?: string | null;
          date: string;
          device_browser?: string | null;
          device_id?: string | null;
          device_model?: string | null;
          device_name?: string | null;
          device_os?: string | null;
          device_screen?: string | null;
          device_type?: string | null;
          id: string;
          is_bill?: boolean;
          merchant: string;
          occurrence_date?: string | null;
          payment_method?: string;
          recurring_id?: string | null;
          source?: string;
          user_id: string;
        };
        Update: {
          amount?: number;
          category_id?: string | null;
          date?: string;
          device_browser?: string | null;
          device_id?: string | null;
          device_model?: string | null;
          device_name?: string | null;
          device_os?: string | null;
          device_screen?: string | null;
          device_type?: string | null;
          id?: string;
          is_bill?: boolean;
          merchant?: string;
          occurrence_date?: string | null;
          payment_method?: string;
          recurring_id?: string | null;
          source?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'expenses_category_fk';
            columns: ['user_id', 'category_id'];
            isOneToOne: false;
            referencedRelation: 'categories';
            referencedColumns: ['user_id', 'id'];
          },
          {
            foreignKeyName: 'expenses_recurring_fk';
            columns: ['user_id', 'recurring_id'];
            isOneToOne: false;
            referencedRelation: 'recurring_expenses';
            referencedColumns: ['user_id', 'id'];
          },
        ];
      };
      field_suggestions: {
        Row: {
          field: string;
          last_used: string | null;
          use_count: number;
          user_id: string;
          value: string;
          value_key: string;
        };
        ComputedFields: never;
        Insert: {
          field: string;
          last_used?: string | null;
          use_count?: number;
          user_id: string;
          value: string;
          value_key?: never;
        };
        Update: {
          field?: string;
          last_used?: string | null;
          use_count?: number;
          user_id?: string;
          value?: string;
          value_key?: never;
        };
        Relationships: [];
      };
      finance_tours: {
        Row: {
          expires_at: string;
          finished_at: string;
          outcome: string;
          user_id: string;
        };
        ComputedFields: never;
        Insert: {
          expires_at?: string;
          finished_at?: string;
          outcome: string;
          user_id: string;
        };
        Update: {
          expires_at?: string;
          finished_at?: string;
          outcome?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      limits: {
        Row: {
          alert_at: number;
          alert_at80: boolean;
          amount: number;
          category_id: string | null;
          delivery: string;
          id: string;
          scope: string;
          user_id: string;
        };
        ComputedFields: never;
        Insert: {
          alert_at?: number;
          alert_at80?: boolean;
          amount?: number;
          category_id?: string | null;
          delivery?: string;
          id: string;
          scope: string;
          user_id: string;
        };
        Update: {
          alert_at?: number;
          alert_at80?: boolean;
          amount?: number;
          category_id?: string | null;
          delivery?: string;
          id?: string;
          scope?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'limits_category_fk';
            columns: ['user_id', 'category_id'];
            isOneToOne: false;
            referencedRelation: 'categories';
            referencedColumns: ['user_id', 'id'];
          },
        ];
      };
      mcp_tokens: {
        Row: {
          created_at: string;
          expires_at: string | null;
          id: string;
          last_used_at: string | null;
          name: string;
          revoked_at: string | null;
          rotated_at: string | null;
          token_hash: string;
          token_hint: string;
          token_tail: string;
          ttl_days: number | null;
          user_id: string;
        };
        ComputedFields: never;
        Insert: {
          created_at?: string;
          expires_at?: string | null;
          id?: string;
          last_used_at?: string | null;
          name: string;
          revoked_at?: string | null;
          rotated_at?: string | null;
          token_hash: string;
          token_hint: string;
          token_tail: string;
          ttl_days?: number | null;
          user_id: string;
        };
        Update: {
          created_at?: string;
          expires_at?: string | null;
          id?: string;
          last_used_at?: string | null;
          name?: string;
          revoked_at?: string | null;
          rotated_at?: string | null;
          token_hash?: string;
          token_hint?: string;
          token_tail?: string;
          ttl_days?: number | null;
          user_id?: string;
        };
        Relationships: [];
      };
      notification_preferences: {
        Row: {
          email: boolean;
          limit_alerts: boolean;
          limit_warnings: boolean;
          push: boolean;
          receipt_confirmations: boolean;
          user_id: string;
        };
        ComputedFields: never;
        Insert: {
          email?: boolean;
          limit_alerts?: boolean;
          limit_warnings?: boolean;
          push?: boolean;
          receipt_confirmations?: boolean;
          user_id: string;
        };
        Update: {
          email?: boolean;
          limit_alerts?: boolean;
          limit_warnings?: boolean;
          push?: boolean;
          receipt_confirmations?: boolean;
          user_id?: string;
        };
        Relationships: [];
      };
      notifications: {
        Row: {
          body: string;
          created_at: string;
          id: string;
          kind: string;
          payload: NonNullable<Json>;
          read_at: string | null;
          title: string;
          user_id: string;
        };
        ComputedFields: never;
        Insert: {
          body?: string;
          created_at?: string;
          id: string;
          kind: string;
          payload?: NonNullable<Json>;
          read_at?: string | null;
          title: string;
          user_id: string;
        };
        Update: {
          body?: string;
          created_at?: string;
          id?: string;
          kind?: string;
          payload?: NonNullable<Json>;
          read_at?: string | null;
          title?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      profile_avatars: {
        Row: {
          updated_at: string;
          user_id: string;
        };
        ComputedFields: never;
        Insert: {
          updated_at?: string;
          user_id: string;
        };
        Update: {
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          created_at: string;
          email: string;
          name: string;
          user_id: string;
        };
        ComputedFields: never;
        Insert: {
          created_at?: string;
          email?: string;
          name?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          email?: string;
          name?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      push_subscriptions: {
        Row: {
          auth: string;
          created_at: string;
          endpoint: string;
          p256dh: string;
          user_id: string;
        };
        ComputedFields: never;
        Insert: {
          auth: string;
          created_at?: string;
          endpoint: string;
          p256dh: string;
          user_id: string;
        };
        Update: {
          auth?: string;
          created_at?: string;
          endpoint?: string;
          p256dh?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      receipt_items: {
        Row: {
          category_id: string;
          discount: number;
          expense_id: string;
          id: string;
          name: string;
          quantity: number;
          unit_price: number;
          user_id: string;
        };
        ComputedFields: never;
        Insert: {
          category_id: string;
          discount?: number;
          expense_id: string;
          id: string;
          name: string;
          quantity?: number;
          unit_price?: number;
          user_id: string;
        };
        Update: {
          category_id?: string;
          discount?: number;
          expense_id?: string;
          id?: string;
          name?: string;
          quantity?: number;
          unit_price?: number;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'receipt_items_category_fk';
            columns: ['user_id', 'category_id'];
            isOneToOne: false;
            referencedRelation: 'categories';
            referencedColumns: ['user_id', 'id'];
          },
          {
            foreignKeyName: 'receipt_items_user_id_expense_id_fkey';
            columns: ['user_id', 'expense_id'];
            isOneToOne: false;
            referencedRelation: 'expenses';
            referencedColumns: ['user_id', 'id'];
          },
        ];
      };
      receipt_scans: {
        Row: {
          created_at: string;
          id: number;
          user_id: string;
        };
        ComputedFields: never;
        Insert: {
          created_at?: string;
          id?: never;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: never;
          user_id?: string;
        };
        Relationships: [];
      };
      recurring_expenses: {
        Row: {
          active: boolean;
          category_id: string | null;
          cost: number;
          end_date: string | null;
          id: string;
          interval: string;
          last_materialized_date: string | null;
          name: string;
          payment_method: string;
          start_date: string;
          user_id: string;
        };
        ComputedFields: never;
        Insert: {
          active?: boolean;
          category_id?: string | null;
          cost?: number;
          end_date?: string | null;
          id: string;
          interval?: string;
          last_materialized_date?: string | null;
          name: string;
          payment_method?: string;
          start_date: string;
          user_id: string;
        };
        Update: {
          active?: boolean;
          category_id?: string | null;
          cost?: number;
          end_date?: string | null;
          id?: string;
          interval?: string;
          last_materialized_date?: string | null;
          name?: string;
          payment_method?: string;
          start_date?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'recurring_expenses_category_fk';
            columns: ['user_id', 'category_id'];
            isOneToOne: false;
            referencedRelation: 'categories';
            referencedColumns: ['user_id', 'id'];
          },
        ];
      };
      recurring_items: {
        Row: {
          category_id: string;
          discount: number;
          id: string;
          name: string;
          quantity: number;
          recurring_id: string;
          unit_price: number;
          user_id: string;
        };
        ComputedFields: never;
        Insert: {
          category_id: string;
          discount?: number;
          id: string;
          name: string;
          quantity?: number;
          recurring_id: string;
          unit_price?: number;
          user_id: string;
        };
        Update: {
          category_id?: string;
          discount?: number;
          id?: string;
          name?: string;
          quantity?: number;
          recurring_id?: string;
          unit_price?: number;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'recurring_items_category_fk';
            columns: ['user_id', 'category_id'];
            isOneToOne: false;
            referencedRelation: 'categories';
            referencedColumns: ['user_id', 'id'];
          },
          {
            foreignKeyName: 'recurring_items_user_id_recurring_id_fkey';
            columns: ['user_id', 'recurring_id'];
            isOneToOne: false;
            referencedRelation: 'recurring_expenses';
            referencedColumns: ['user_id', 'id'];
          },
        ];
      };
      time_categories: {
        Row: {
          color: string;
          icon: string;
          id: string;
          name: string;
          user_id: string;
        };
        ComputedFields: never;
        Insert: {
          color?: string;
          icon?: string;
          id: string;
          name: string;
          user_id: string;
        };
        Update: {
          color?: string;
          icon?: string;
          id?: string;
          name?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      time_priorities: {
        Row: {
          id: string;
          name: string;
          user_id: string;
          value: number;
        };
        ComputedFields: never;
        Insert: {
          id: string;
          name: string;
          user_id: string;
          value: number;
        };
        Update: {
          id?: string;
          name?: string;
          user_id?: string;
          value?: number;
        };
        Relationships: [];
      };
      time_recurring: {
        Row: {
          active: boolean;
          at: string | null;
          category_id: string;
          description: string | null;
          end_date: string | null;
          id: string;
          interval: string;
          last_materialized_date: string | null;
          priority_id: string;
          start_date: string;
          title: string;
          user_id: string;
        };
        ComputedFields: never;
        Insert: {
          active?: boolean;
          at?: string | null;
          category_id: string;
          description?: string | null;
          end_date?: string | null;
          id: string;
          interval?: string;
          last_materialized_date?: string | null;
          priority_id: string;
          start_date: string;
          title: string;
          user_id: string;
        };
        Update: {
          active?: boolean;
          at?: string | null;
          category_id?: string;
          description?: string | null;
          end_date?: string | null;
          id?: string;
          interval?: string;
          last_materialized_date?: string | null;
          priority_id?: string;
          start_date?: string;
          title?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'time_recurring_category_fk';
            columns: ['user_id', 'category_id'];
            isOneToOne: false;
            referencedRelation: 'time_categories';
            referencedColumns: ['user_id', 'id'];
          },
          {
            foreignKeyName: 'time_recurring_priority_fk';
            columns: ['user_id', 'priority_id'];
            isOneToOne: false;
            referencedRelation: 'time_priorities';
            referencedColumns: ['user_id', 'id'];
          },
        ];
      };
      time_task_attachments: {
        Row: {
          created_at: string;
          id: string;
          mime: string;
          name: string;
          size: number;
          task_id: string;
          user_id: string;
        };
        ComputedFields: never;
        Insert: {
          created_at?: string;
          id?: string;
          mime: string;
          name: string;
          size: number;
          task_id: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          mime?: string;
          name?: string;
          size?: number;
          task_id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'time_task_attachments_task_fk';
            columns: ['user_id', 'task_id'];
            isOneToOne: false;
            referencedRelation: 'time_tasks';
            referencedColumns: ['user_id', 'id'];
          },
        ];
      };
      time_task_comments: {
        Row: {
          body: string;
          bot_name: string | null;
          bot_ref: string | null;
          created_at: string;
          edited_at: string | null;
          id: string;
          mcp_token_id: string | null;
          task_id: string;
          user_id: string;
        };
        ComputedFields: never;
        Insert: {
          body: string;
          bot_name?: string | null;
          bot_ref?: string | null;
          created_at?: string;
          edited_at?: string | null;
          id?: string;
          mcp_token_id?: string | null;
          task_id: string;
          user_id: string;
        };
        Update: {
          body?: string;
          bot_name?: string | null;
          bot_ref?: string | null;
          created_at?: string;
          edited_at?: string | null;
          id?: string;
          mcp_token_id?: string | null;
          task_id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'time_task_comments_mcp_token_id_fkey';
            columns: ['mcp_token_id'];
            isOneToOne: false;
            referencedRelation: 'mcp_tokens';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'time_task_comments_task_fk';
            columns: ['user_id', 'task_id'];
            isOneToOne: false;
            referencedRelation: 'time_tasks';
            referencedColumns: ['user_id', 'id'];
          },
        ];
      };
      time_task_keys: {
        Row: {
          last_number: number;
          prefix: string;
          user_id: string;
        };
        ComputedFields: never;
        Insert: {
          last_number?: number;
          prefix: string;
          user_id: string;
        };
        Update: {
          last_number?: number;
          prefix?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      time_tasks: {
        Row: {
          at: string | null;
          category_id: string;
          created_at: string;
          day: string | null;
          description: string | null;
          device_browser: string | null;
          device_id: string | null;
          device_model: string | null;
          device_name: string | null;
          device_os: string | null;
          device_screen: string | null;
          device_type: string | null;
          done: boolean;
          id: string;
          in_progress: boolean;
          key: string;
          occurrence_date: string | null;
          priority_id: string;
          recurring_id: string | null;
          title: string;
          user_id: string;
        };
        ComputedFields: never;
        Insert: {
          at?: string | null;
          category_id: string;
          created_at?: string;
          day?: string | null;
          description?: string | null;
          device_browser?: string | null;
          device_id?: string | null;
          device_model?: string | null;
          device_name?: string | null;
          device_os?: string | null;
          device_screen?: string | null;
          device_type?: string | null;
          done?: boolean;
          id: string;
          in_progress?: boolean;
          key?: string;
          occurrence_date?: string | null;
          priority_id: string;
          recurring_id?: string | null;
          title: string;
          user_id: string;
        };
        Update: {
          at?: string | null;
          category_id?: string;
          created_at?: string;
          day?: string | null;
          description?: string | null;
          device_browser?: string | null;
          device_id?: string | null;
          device_model?: string | null;
          device_name?: string | null;
          device_os?: string | null;
          device_screen?: string | null;
          device_type?: string | null;
          done?: boolean;
          id?: string;
          in_progress?: boolean;
          key?: string;
          occurrence_date?: string | null;
          priority_id?: string;
          recurring_id?: string | null;
          title?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'time_tasks_category_fk';
            columns: ['user_id', 'category_id'];
            isOneToOne: false;
            referencedRelation: 'time_categories';
            referencedColumns: ['user_id', 'id'];
          },
          {
            foreignKeyName: 'time_tasks_priority_fk';
            columns: ['user_id', 'priority_id'];
            isOneToOne: false;
            referencedRelation: 'time_priorities';
            referencedColumns: ['user_id', 'id'];
          },
          {
            foreignKeyName: 'time_tasks_recurring_fk';
            columns: ['user_id', 'recurring_id'];
            isOneToOne: false;
            referencedRelation: 'time_recurring';
            referencedColumns: ['user_id', 'id'];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      claim_receipt_scan: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
      mcp_add_task_attachment: {
        Args: {
          p_id: string;
          p_mime: string;
          p_name: string;
          p_size: number;
          p_task_id: string;
          p_token: string;
        };
        Returns: Json;
      };
      mcp_add_task_comment: {
        Args: { p_body: string; p_task_id: string; p_token: string };
        Returns: Json;
      };
      mcp_authenticate: { Args: { p_token: string }; Returns: boolean };
      mcp_create_category: {
        Args: {
          p_color: string;
          p_icon: string;
          p_name: string;
          p_token: string;
        };
        Returns: Json;
      };
      mcp_create_priority: {
        Args: { p_name: string; p_token: string; p_value: number };
        Returns: Json;
      };
      mcp_create_task: {
        Args: {
          p_at?: string;
          p_category: string;
          p_day?: string;
          p_description?: string;
          p_priority: string;
          p_title: string;
          p_token: string;
        };
        Returns: Json;
      };
      mcp_delete_category: {
        Args: { p_id: string; p_token: string };
        Returns: boolean;
      };
      mcp_delete_task: {
        Args: { p_id: string; p_token: string };
        Returns: boolean;
      };
      mcp_delete_task_attachment: {
        Args: { p_id: string; p_token: string };
        Returns: string;
      };
      mcp_get_expense: {
        Args: { p_id: string; p_token: string };
        Returns: Json;
      };
      mcp_get_task: { Args: { p_id: string; p_token: string }; Returns: Json };
      mcp_header_user: { Args: Record<PropertyKey, never>; Returns: string };
      mcp_list_categories: { Args: { p_token: string }; Returns: Json };
      mcp_list_expenses: {
        Args: {
          p_category_id?: string;
          p_from?: string;
          p_limit?: number;
          p_offset?: number;
          p_to?: string;
          p_token: string;
        };
        Returns: Json;
      };
      mcp_list_priorities: { Args: { p_token: string }; Returns: Json };
      mcp_list_task_attachments: {
        Args: { p_task_id: string; p_token: string };
        Returns: Json;
      };
      mcp_list_task_comments: {
        Args: { p_task_id: string; p_token: string };
        Returns: Json;
      };
      mcp_list_tasks: {
        Args: {
          p_backlog?: boolean;
          p_category?: string;
          p_from?: string;
          p_limit?: number;
          p_offset?: number;
          p_status?: string;
          p_to?: string;
          p_token: string;
        };
        Returns: Json;
      };
      mcp_resolve_category: {
        Args: { p_ref: string; p_user: string };
        Returns: string;
      };
      mcp_resolve_priority: {
        Args: { p_ref: string; p_user: string };
        Returns: string;
      };
      mcp_set_task_status: {
        Args: { p_id: string; p_status: string; p_token: string };
        Returns: Json;
      };
      mcp_task_json: { Args: { p_id: string; p_user: string }; Returns: Json };
      mcp_token_user: { Args: { p_token: string }; Returns: string };
      mcp_update_category: {
        Args: { p_id: string; p_patch: Json; p_token: string };
        Returns: Json;
      };
      mcp_update_task: {
        Args: { p_id: string; p_patch: Json; p_token: string };
        Returns: Json;
      };
      mcp_user: { Args: { p_token: string }; Returns: string };
      next_task_key: { Args: { p_user: string }; Returns: string };
      record_field_use: {
        Args: { p_field: string; p_value: string };
        Returns: undefined;
      };
      seed_time_defaults: { Args: { target: string }; Returns: undefined };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  'public'
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] &
        DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] &
        DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema['Tables'] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema['Tables'] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema['Enums'] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {},
  },
} as const;
