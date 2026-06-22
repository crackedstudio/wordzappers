export type Screen =
  | 'home'
  | 'tutorialWatch'
  | 'tutorialTry'
  | 'game'
  | 'result'
  | 'claim'
  | 'leaderboard';

export type GameStatus = 'idle' | 'correct' | 'wrong';
export type ClaimState = 'disconnected' | 'ready';
export type LbTab = 'today' | 'all';
export type GameResult = 'win' | 'timeout';
export type TutStatus = 'idle' | 'done';

export interface TileDatum {
  id: string;
  letter: string;
}

export interface AppState {
  screen: Screen;
  dark: boolean;
  streak: number;
  bestToday: number | null;
  unclaimed: number;
  builtPath: string[];
  tray: TileDatum[];
  slots: (string | null)[];
  status: GameStatus;
  timeLeft: number;
  running: boolean;
  score: number;
  result: GameResult | null;
  tutTray: TileDatum[];
  tutSlots: (string | null)[];
  tutStatus: TutStatus;
  claimState: ClaimState;
  claimed: boolean;
  lbTab: LbTab;
}

export interface LeaderRow {
  r: number;
  n: string;
  s: number;
  me?: boolean;
}
