import { View, Text, StyleSheet } from "react-native";

export default function About() {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>About</Text>
            <Text style={styles.text}>
                A React Native boilerplate app that lets you export your
                contacts as json from your iPhone.
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
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
