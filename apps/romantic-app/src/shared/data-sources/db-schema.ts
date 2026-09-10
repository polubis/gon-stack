export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never;
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      graphql: {
        Args: {
          extensions?: Json;
          operationName?: string;
          query?: string;
          variables?: Json;
        };
        Returns: Json;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
  public: {
    Tables: {
      answers: {
        Row: {
          answer_value: Json | null;
          answered_at: string;
          game_id: string;
          id: string;
          question_id: string;
          score: number;
          user_id: string;
        };
        Insert: {
          answer_value?: Json | null;
          answered_at?: string;
          game_id: string;
          id?: string;
          question_id: string;
          score?: number;
          user_id: string;
        };
        Update: {
          answer_value?: Json | null;
          answered_at?: string;
          game_id?: string;
          id?: string;
          question_id?: string;
          score?: number;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'answers_game_id_fkey';
            columns: ['game_id'];
            isOneToOne: false;
            referencedRelation: 'games';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'answers_question_id_fkey';
            columns: ['question_id'];
            isOneToOne: false;
            referencedRelation: 'questions';
            referencedColumns: ['id'];
          },
        ];
      };
      game_participants: {
        Row: {
          game_id: string;
          id: string;
          joined_at: string;
          user_id: string;
        };
        Insert: {
          game_id: string;
          id?: string;
          joined_at?: string;
          user_id: string;
        };
        Update: {
          game_id?: string;
          id?: string;
          joined_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'game_participants_game_id_fkey';
            columns: ['game_id'];
            isOneToOne: false;
            referencedRelation: 'games';
            referencedColumns: ['id'];
          },
        ];
      };
      game_scores: {
        Row: {
          game_id: string;
          id: string;
          rank: number | null;
          total_score: number;
          user_id: string;
        };
        Insert: {
          game_id: string;
          id?: string;
          rank?: number | null;
          total_score?: number;
          user_id: string;
        };
        Update: {
          game_id?: string;
          id?: string;
          rank?: number | null;
          total_score?: number;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'game_scores_game_id_fkey';
            columns: ['game_id'];
            isOneToOne: false;
            referencedRelation: 'games';
            referencedColumns: ['id'];
          },
        ];
      };
      games: {
        Row: {
          category: string;
          created_at: string;
          created_by: string;
          current_question_order: number | null;
          description: string | null;
          difficulty: string;
          finished_at: string | null;
          id: string;
          max_players: number;
          min_players: number;
          name: string;
          room_id: string;
          sort_order: number;
          started_at: string | null;
          status: string;
          time_per_question: number;
          type: string;
        };
        Insert: {
          category: string;
          created_at?: string;
          created_by: string;
          current_question_order?: number | null;
          description?: string | null;
          difficulty: string;
          finished_at?: string | null;
          id?: string;
          max_players?: number;
          min_players?: number;
          name: string;
          room_id: string;
          sort_order?: number;
          started_at?: string | null;
          status?: string;
          time_per_question: number;
          type?: string;
        };
        Update: {
          category?: string;
          created_at?: string;
          created_by?: string;
          current_question_order?: number | null;
          description?: string | null;
          difficulty?: string;
          finished_at?: string | null;
          id?: string;
          max_players?: number;
          min_players?: number;
          name?: string;
          room_id?: string;
          sort_order?: number;
          started_at?: string | null;
          status?: string;
          time_per_question?: number;
          type?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'games_room_id_fkey';
            columns: ['room_id'];
            isOneToOne: false;
            referencedRelation: 'rooms';
            referencedColumns: ['id'];
          },
        ];
      };
      profile_questions: {
        Row: {
          badge_max: string | null;
          badge_min: string | null;
          created_at: string;
          default_numeric: number | null;
          default_text: string | null;
          group_description: string;
          group_key: string;
          group_label: string;
          id: number;
          key: string;
          label: string;
          max_value: number | null;
          min_value: number | null;
          question_type: Database['public']['Enums']['question_type'];
          required: boolean;
          select_options: Json | null;
        };
        Insert: {
          badge_max?: string | null;
          badge_min?: string | null;
          created_at?: string;
          default_numeric?: number | null;
          default_text?: string | null;
          group_description: string;
          group_key: string;
          group_label: string;
          id?: never;
          key: string;
          label: string;
          max_value?: number | null;
          min_value?: number | null;
          question_type: Database['public']['Enums']['question_type'];
          required?: boolean;
          select_options?: Json | null;
        };
        Update: {
          badge_max?: string | null;
          badge_min?: string | null;
          created_at?: string;
          default_numeric?: number | null;
          default_text?: string | null;
          group_description?: string;
          group_key?: string;
          group_label?: string;
          id?: never;
          key?: string;
          label?: string;
          max_value?: number | null;
          min_value?: number | null;
          question_type?: Database['public']['Enums']['question_type'];
          required?: boolean;
          select_options?: Json | null;
        };
        Relationships: [];
      };
      question_options: {
        Row: {
          id: string;
          is_correct: boolean;
          question_id: string;
          sort_order: number;
          text: string;
        };
        Insert: {
          id?: string;
          is_correct?: boolean;
          question_id: string;
          sort_order?: number;
          text: string;
        };
        Update: {
          id?: string;
          is_correct?: boolean;
          question_id?: string;
          sort_order?: number;
          text?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'question_options_question_id_fkey';
            columns: ['question_id'];
            isOneToOne: false;
            referencedRelation: 'questions';
            referencedColumns: ['id'];
          },
        ];
      };
      questions: {
        Row: {
          game_id: string;
          id: string;
          prompt: string;
          sort_order: number;
          type: string;
        };
        Insert: {
          game_id: string;
          id?: string;
          prompt: string;
          sort_order?: number;
          type: string;
        };
        Update: {
          game_id?: string;
          id?: string;
          prompt?: string;
          sort_order?: number;
          type?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'questions_game_id_fkey';
            columns: ['game_id'];
            isOneToOne: false;
            referencedRelation: 'games';
            referencedColumns: ['id'];
          },
        ];
      };
      room_participants: {
        Row: {
          id: string;
          joined_at: string;
          room_id: string;
          user_id: string;
        };
        Insert: {
          id?: string;
          joined_at?: string;
          room_id: string;
          user_id: string;
        };
        Update: {
          id?: string;
          joined_at?: string;
          room_id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'room_participants_room_id_fkey';
            columns: ['room_id'];
            isOneToOne: false;
            referencedRelation: 'rooms';
            referencedColumns: ['id'];
          },
        ];
      };
      rooms: {
        Row: {
          code: string;
          created_at: string;
          created_by: string;
          id: string;
          is_public: boolean;
          name: string;
          password_hash: string | null;
        };
        Insert: {
          code: string;
          created_at?: string;
          created_by: string;
          id?: string;
          is_public?: boolean;
          name: string;
          password_hash?: string | null;
        };
        Update: {
          code?: string;
          created_at?: string;
          created_by?: string;
          id?: string;
          is_public?: boolean;
          name?: string;
          password_hash?: string | null;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      is_game_participant: { Args: { p_game_id: string }; Returns: boolean };
      is_room_member: { Args: { p_room_id: string }; Returns: boolean };
      join_room: {
        Args: { p_code: string; p_password?: string };
        Returns: string;
      };
      upsert_game_score: {
        Args: { p_game_id: string; p_score: number; p_user_id: string };
        Returns: undefined;
      };
    };
    Enums: {
      question_type: 'numeric' | 'select' | 'text' | 'slide';
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      question_type: ['numeric', 'select', 'text', 'slide'],
    },
  },
} as const;
