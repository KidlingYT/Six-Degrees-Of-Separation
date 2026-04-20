import * as Contacts from "expo-contacts";
import { useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    SafeAreaView,
    ActivityIndicator,
} from "react-native";
import { Searchbar } from 'react-native-paper';
// import { Host } from "@expo/ui/jetpack-compose";

type ContactItem = {
    id: string;
    name: string;
    phoneNumbers?: string[];
    emails?: string[];
};

export default function People() {
    const [contacts, setContacts] = useState<ContactItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState<string>("");
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        loadContacts();
    }, []);

    const loadContacts = async () => {
        try {
            const { status: permissionStatus } =
                await Contacts.requestPermissionsAsync();
            if (permissionStatus === "granted") {
                const { data } = await Contacts.getContactsAsync({
                    fields: [
                        Contacts.Fields.Name,
                        Contacts.Fields.PhoneNumbers,
                        Contacts.Fields.Emails,
                    ],
                });

                let formattedContacts: ContactItem[] = data.map(
                    (contact) => ({
                        id: contact.id,
                        name: contact.name || "Unknown",
                        phoneNumbers: contact.phoneNumbers?.map(
                            (p) => p.number || "",
                        ),
                        emails: contact.emails?.map((e) => e.email || ""),
                    }),
                );

                // Sort alphabetically by name
                formattedContacts.sort((a, b) => a.name.localeCompare(b.name));

                if (searchQuery.trim() !== "") {
                    const lowerQuery = searchQuery.toLowerCase();
                    formattedContacts = formattedContacts.filter((contact) =>
                        contact.name.toLowerCase().includes(lowerQuery)
                    );
                }
                setContacts(formattedContacts);
                setStatus(`Loaded ${formattedContacts.length} contacts`);
            } else {
                setStatus("Permission denied");
            }
        } catch (error) {
            setStatus(`Error: ${error}`);
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const renderContact = ({ item }: { item: ContactItem }) => (
        <View style={styles.contactItem}>
            <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                    {item.name.charAt(0).toUpperCase()}
                </Text>
            </View>
            <View style={styles.contactInfo}>
                <Text style={styles.contactName}>{item.name}</Text>
                {item.phoneNumbers && item.phoneNumbers.length > 0 && (
                    <Text style={styles.contactDetail}>
                        📞 {item.phoneNumbers[0]}
                    </Text>
                )}
                {item.emails && item.emails.length > 0 && (
                    <Text style={styles.contactDetail}>
                        ✉️ {item.emails[0]}
                    </Text>
                )}
            </View>
        </View>
    );

    if (loading) {
        return (
            <View style={styles.centerContainer}>

                <Text style={styles.loadingText}>Loading contacts...</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>People </Text>
                <Text style={styles.subtitle}>{status}</Text>
            </View>
                <Searchbar
                    style={{ backgroundColor: "#FFFFFF" }}
                    placeholder="Search"
                    onChangeText={setSearchQuery}
                    onSubmitEditing={loadContacts}
                    value={searchQuery}
                    mode="view"
                />
            {contacts.length === 0 ? (
                <View style={styles.centerContainer}>
                    <Text style={styles.emptyText}>No contacts found</Text>
                </View>
            ) : (
                <FlatList
                    data={contacts}
                    renderItem={renderContact}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContent}
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F2F2F7",
    },
    centerContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    header: {
        padding: 16,
        backgroundColor: "#FFFFFF",
        borderBottomWidth: 1,
        borderBottomColor: "#E5E5EA",
    },
    title: {
        fontSize: 34,
        fontWeight: "bold",
        color: "#000000",
    },
    subtitle: {
        fontSize: 14,
        color: "#8E8E93",
        marginTop: 4,
    },
    listContent: {
        paddingBottom: 20,
    },
    contactItem: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#FFFFFF",
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#E5E5EA",
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: "#007AFF",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12,
    },
    avatarText: {
        fontSize: 22,
        fontWeight: "bold",
        color: "#FFFFFF",
    },
    contactInfo: {
        flex: 1,
    },
    contactName: {
        fontSize: 17,
        fontWeight: "600",
        color: "#000000",
    },
    contactDetail: {
        fontSize: 14,
        color: "#8E8E93",
        marginTop: 2,
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: "#8E8E93",
    },
    emptyText: {
        fontSize: 18,
        color: "#8E8E93",
    },
});
