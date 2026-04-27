import { GestureDetector, Gesture, Directions } from 'react-native-gesture-handler';
import { usePathname, useRouter } from 'expo-router';
import { View } from 'react-native';
import { ReactNode } from 'react';
import { useSettings } from '../Context/Settings';

export default function SwipeTabView({children} : {children: ReactNode}) {
  const router = useRouter();
  const path = usePathname();
  const {isSwipeInverted} = useSettings();

  const flingLeft = Gesture.Fling()
  .runOnJS(true)
    .direction(isSwipeInverted ?  Directions.LEFT : Directions.RIGHT)
    .onEnd(() => {
        switch (path) {
            case '/Home':
                router.replace('/');
                break;
            case '/People':
                router.replace('/Home');
                break;
            case '/Settings':
                router.replace('/People');
                break;
            default: 
                router.replace('/');
        }
    });

  const flingRight = Gesture.Fling()
    .runOnJS(true)
    .direction(isSwipeInverted ?  Directions.RIGHT : Directions.LEFT)
    .onEnd(() => {
        switch (path) {
            case '/':
                router.replace('/Home');
                break;
            case '/Home':
                router.replace('/People');
                break;
            case '/People':
                router.replace('/Settings');
                break;
            default: 
                router.replace('/Settings');
        }
    });

  const gesture = Gesture.Exclusive(flingLeft, flingRight);

  return (
      <GestureDetector gesture={gesture}>
        <View style={{ flex: 1 }}>{children}</View>
      </GestureDetector>
  );
}