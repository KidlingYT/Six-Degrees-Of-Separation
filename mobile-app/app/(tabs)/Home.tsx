import * as Contacts from "expo-contacts";
import { File, Paths } from "expo-file-system/next";
import * as Sharing from "expo-sharing";
import { useEffect, useState } from "react";
import { Button, StyleSheet, Text, View } from "react-native";
import { Link } from "expo-router";

export default function Home() {
    const [contacts, setContacts] = useState<Contacts.Contact[]>();
    const [status, setStatus] = useState<string>("Loading...");

    useEffect(() => {
        (async () => {
            const { status } = await Contacts.requestPermissionsAsync();
            if (status === "granted") {
                const { data } = await Contacts.getContactsAsync({
                    fields: [
                        Contacts.Fields.Name,
                        Contacts.Fields.PhoneNumbers,
                        Contacts.Fields.Emails,
                    ],
                });
                setContacts(data);
                setStatus(`Loaded ${data.length} contacts`);
            } else {
                setStatus("Permission denied");
            }
        })();
    }, []);

    const exportContacts = async () => {
        if (!contacts) return;

        try {
            const file = new File(Paths.document, "contacts.json");
            const jsonData = JSON.stringify(contacts, null, 2);

            file.write(jsonData);

            setStatus(`Saved to ${file.uri}`);

            // Share the file so you can save it to your computer
            if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(file.uri);
            }
        } catch (error) {
            setStatus(`Error: ${error}`);
            console.error(error);
        }
    };

    return (
            <View style={styles.wrapper}>
                <View style={styles.container}>
                    <Text>{status}</Text>
                    <Button title="Export Contacts" onPress={exportContacts} />
                    <Link href="/People" asChild>
                        <Button title="View People" />
                    </Link>
                </View>
            </View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        flex: 1,
        backgroundColor: "#fff",
    },
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        gap: 16,
    },
});
