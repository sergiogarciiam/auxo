import { useAudioPlayer } from "expo-audio";

const beep = require("../../assets/beep.wav");
const doubleBeep = require("../../assets/double-beep.wav");

export const useWorkoutBeeps = () => {
  const beepPlayer = useAudioPlayer(beep);
  const doubleBeepPlayer = useAudioPlayer(doubleBeep);

  const playBeep = () => {
    beepPlayer.seekTo(0);
    beepPlayer.play();
  };

  const playDoubleBeep = () => {
    doubleBeepPlayer.seekTo(0);
    doubleBeepPlayer.play();
  };

  return { playBeep, playDoubleBeep };
};
