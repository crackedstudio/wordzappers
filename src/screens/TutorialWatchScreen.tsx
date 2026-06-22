import React from 'react';
import type { AppState, Screen } from '../types';
import type { Palette } from '../theme';
import { ACCENT } from '../gameLogic';

interface Props {
  state: AppState;
  p: Palette;
  go: (s: Screen) => void;
}

const SCRAMBLED = ['D', 'R', 'O', 'W'];
const FORMED = ['W', 'O', 'R', 'D'];

export default function TutorialWatchScreen({ p, go }: Props) {
  const A = ACCENT;

  return (
    <div style={{ padding: '18px 24px 28px', display: 'flex', flexDirection: 'column', height: '100%', boxSizing: 'border-box' }}>

      {/* Top bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ font: "700 11px 'Space Mono'", letterSpacing: '2px', textTransform: 'uppercase', color: p.ink2 }}>
          How it works · 1 of 2
        </span>
        <button
          onClick={() => go('game')}
          style={{ background: 'none', border: 'none', font: "700 12px 'Space Mono'", color: p.ink2, cursor: 'pointer' }}
        >
          Skip ✕
        </button>
      </div>

      {/* Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '34px' }}>

        {/* Hero text */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ font: '900 32px Archivo', letterSpacing: '-1px', color: p.ink, lineHeight: '1.05' }}>
            Scramble.<br />Tap. Climb.
          </div>
          <div style={{ font: "400 14px 'Space Mono'", color: p.ink2, marginTop: '12px' }}>
            Unscramble each rung against the clock.
          </div>
        </div>

        {/* Animated sweep demo */}
        <div style={{ position: 'relative', width: '288px', height: '74px' }}>
          <div
            className="wz-sweep-cursor"
            style={{
              width: '48px', height: '60px', borderRadius: '12px',
              border: `2.5px solid ${A}`,
              boxShadow: `0 4px 12px rgba(217,119,6,.3)`,
              boxSizing: 'border-box',
            }}
          />
          <div style={{ display: 'flex', gap: '24px' }}>
            {SCRAMBLED.map((letter, i) => (
              <div key={i} style={{
                width: '48px', height: '60px', borderRadius: '12px',
                background: p.tileface,
                boxShadow: `inset 0 2px 0 ${p.tilehi}, inset 0 -5px 0 ${p.tileedge}, 0 3px 6px ${p.shadow}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                font: '800 26px Archivo', color: p.tileink,
              }}>
                {letter}
              </div>
            ))}
          </div>
        </div>

        <div style={{ font: "700 22px 'Space Mono'", color: A }}>↓</div>

        {/* Formed word with bob animation */}
        <div style={{ display: 'flex', gap: '10px' }}>
          {FORMED.map((letter, i) => (
            <div
              key={i}
              className={`wz-bob-${i}`}
              style={{
                width: '52px', height: '64px', borderRadius: '12px',
                background: A,
                boxShadow: 'inset 0 -5px 0 rgba(0,0,0,.2), 0 3px 8px rgba(217,119,6,.35)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                font: '800 28px Archivo', color: '#fff',
              }}
            >
              {letter}
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <button
        onClick={() => go('tutorialTry')}
        style={{
          width: '100%', border: 'none', borderRadius: '16px', padding: '19px',
          font: '900 19px Archivo', letterSpacing: '2px', color: '#fff',
          background: A, cursor: 'pointer',
          boxShadow: '0 6px 18px rgba(217,119,6,.4)',
        }}
      >
        Try it →
      </button>
    </div>
  );
}
