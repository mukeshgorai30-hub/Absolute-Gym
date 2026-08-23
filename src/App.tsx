/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { GymProvider } from './context/GymContext';
import { GymAppContent } from './GymAppContent';

export default function App() {
  return (
    <GymProvider>
      <GymAppContent />
    </GymProvider>
  );
}
