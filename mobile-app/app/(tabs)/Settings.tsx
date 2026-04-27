import { useState } from "react";
import { View, StyleSheet, Switch, Text } from "react-native";
import { useSettings } from "../Context/Settings";

export default function Settings() {
    const {isSwipeInverted, toggleSwipeInvert} = useSettings();
    const [isEnabled, setIsEnabled] = useState(isSwipeInverted);
    const toggleSwitch = () => {
        toggleSwipeInvert();
        setIsEnabled(previousState => !previousState);
    };
    return (
            <View style={styles.wrapper}>
                <View style={styles.container}>
                    <View style={styles.switchContainer}>
                    <Switch 
                        trackColor={{false: '#767577', true: '#81b0ff'}}
                        thumbColor={isEnabled ? '#007AFF' : '#f4f3f4'}
                        ios_backgroundColor="#3e3e3e"
                        onValueChange={toggleSwitch}
                        value={isEnabled}
                        />
                    <Text style={styles.text}>Invert Swipe</Text>
                    </View> 

                </View>
            </View>
    );
}


const styles = StyleSheet.create({
    wrapper: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    switchContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        width: "40%",
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 20,
    },
    text: {
        fontSize: 16,
        textAlign: "center",
    },
});
