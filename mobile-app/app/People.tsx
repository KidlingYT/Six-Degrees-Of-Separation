import * as Contacts from "expo-contacts";
import { useEffect, useMemo, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    SafeAreaView,
    ActivityIndicator,
    TouchableOpacity,
    Alert,
    Modal,
    TextInput,
    ScrollView,
} from "react-native";
import {
    insertContact,
    loadSavedContacts,
    updateContactTags,
    type SavedContactSummary,
} from "../lib";

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
    const [savedByApple, setSavedByApple] = useState<
        Map<string, SavedContactSummary>
    >(new Map());
    const [savingIds, setSavingIds] = useState<Set<string>>(new Set());
    const [activeTag, setActiveTag] = useState<string | null>(null);
    const [tagTarget, setTagTarget] = useState<ContactItem | null>(null);
    const [tagInput, setTagInput] = useState("");

    useEffect(() => {
        loadContacts();
    }, []);

    const loadContacts = async () => {
        try {
            const { status: permissionStatus } =
                await Contacts.requestPermissionsAsync();
            if (permissionStatus !== "granted") {
                setStatus("Permission denied");
                return;
            }

            const { data } = await Contacts.getContactsAsync({
                fields: [
                    Contacts.Fields.Name,
                    Contacts.Fields.PhoneNumbers,
                    Contacts.Fields.Emails,
                ],
            });

            const formatted: ContactItem[] = data.map((c) => ({
                id: c.id,
                name: c.name || "Unknown",
                phoneNumbers: c.phoneNumbers?.map((p) => p.number || ""),
                emails: c.emails?.map((e) => e.email || ""),
            }));

            formatted.sort((a, b) => a.name.localeCompare(b.name));
            setContacts(formatted);
            setStatus(`Loaded ${formatted.length} contacts`);

            try {
                const saved = await loadSavedContacts();
                setSavedByApple(saved);
                setStatus(
                    `Loaded ${formatted.length} contacts · ${saved.size} saved`,
                );
            } catch (e: any) {
                setStatus(
                    `Loaded ${formatted.length} contacts · sync failed: ${e.message}`,
                );
            }
        } catch (error) {
            setStatus(`Error: ${error}`);
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (item: ContactItem) => {
        if (savedByApple.has(item.id) || savingIds.has(item.id)) return;

        setSavingIds((prev) => new Set(prev).add(item.id));
        try {
            const doc = await insertContact({ appleContactId: item.id });
            setSavedByApple((prev) => {
                const next = new Map(prev);
                next.set(item.id, { _id: doc._id, tags: doc.tags });
                return next;
            });
        } catch (e: any) {
            Alert.alert("Couldn't save", e.message);
        } finally {
            setSavingIds((prev) => {
                const next = new Set(prev);
                next.delete(item.id);
                return next;
            });
        }
    };

    const handleAddTag = async () => {
        if (!tagTarget) return;
        const tag = tagInput.trim();
        const existing = savedByApple.get(tagTarget.id);
        if (!tag || !existing) {
            closeTagModal();
            return;
        }
        if (existing.tags.includes(tag)) {
            closeTagModal();
            return;
        }

        const nextTags = [...existing.tags, tag];
        try {
            await updateContactTags(existing._id, nextTags);
            setSavedByApple((prev) => {
                const next = new Map(prev);
                next.set(tagTarget.id, { _id: existing._id, tags: nextTags });
                return next;
            });
        } catch (e: any) {
            Alert.alert("Couldn't tag", e.message);
        } finally {
            closeTagModal();
        }
    };

    const closeTagModal = () => {
        setTagTarget(null);
        setTagInput("");
    };

    const allTags = useMemo(() => {
        const set = new Set<string>();
        savedByApple.forEach((v) => v.tags.forEach((t) => set.add(t)));
        return [...set].sort();
    }, [savedByApple]);

    const visibleContacts = useMemo(() => {
        if (!activeTag) return contacts;
        return contacts.filter((c) =>
            savedByApple.get(c.id)?.tags.includes(activeTag),
        );
    }, [contacts, savedByApple, activeTag]);

    const renderContact = ({ item }: { item: ContactItem }) => {
        const saved = savedByApple.get(item.id);
        const isSaving = savingIds.has(item.id);

        return (
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
                    {saved && saved.tags.length > 0 && (
                        <View style={styles.tagRow}>
                            {saved.tags.map((t) => (
                                <View key={t} style={styles.tagChip}>
                                    <Text style={styles.tagChipText}>{t}</Text>
                                </View>
                            ))}
                        </View>
                    )}
                </View>
                {saved ? (
                    <TouchableOpacity
                        style={styles.addTagButton}
                        onPress={() => setTagTarget(item)}
                    >
                        <Text style={styles.addTagButtonText}>+ Tag</Text>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity
                        style={[
                            styles.saveButton,
                            isSaving && styles.saveButtonDisabled,
                        ]}
                        onPress={() => handleSave(item)}
                        disabled={isSaving}
                    >
                        <Text style={styles.saveButtonText}>
                            {isSaving ? "…" : "+ Save"}
                        </Text>
                    </TouchableOpacity>
                )}
            </View>
        );
    };

    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
                <Text style={styles.loadingText}>Loading contacts...</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>People</Text>
                <Text style={styles.subtitle}>{status}</Text>
                {allTags.length > 0 && (
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        style={styles.filterRow}
                        contentContainerStyle={styles.filterRowContent}
                    >
                        <TouchableOpacity
                            style={[
                                styles.filterChip,
                                activeTag === null && styles.filterChipActive,
                            ]}
                            onPress={() => setActiveTag(null)}
                        >
                            <Text
                                style={[
                                    styles.filterChipText,
                                    activeTag === null &&
                                        styles.filterChipTextActive,
                                ]}
                            >
                                All
                            </Text>
                        </TouchableOpacity>
                        {allTags.map((t) => (
                            <TouchableOpacity
                                key={t}
                                style={[
                                    styles.filterChip,
                                    activeTag === t && styles.filterChipActive,
                                ]}
                                onPress={() => setActiveTag(t)}
                            >
                                <Text
                                    style={[
                                        styles.filterChipText,
                                        activeTag === t &&
                                            styles.filterChipTextActive,
                                    ]}
                                >
                                    {t}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                )}
            </View>
            {visibleContacts.length === 0 ? (
                <View style={styles.centerContainer}>
                    <Text style={styles.emptyText}>
                        {activeTag
                            ? `No contacts tagged "${activeTag}"`
                            : "No contacts found"}
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={visibleContacts}
                    renderItem={renderContact}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContent}
                />
            )}

            <Modal
                visible={tagTarget !== null}
                transparent
                animationType="fade"
                onRequestClose={closeTagModal}
            >
                <View style={styles.modalBackdrop}>
                    <View style={styles.modalCard}>
                        <Text style={styles.modalTitle}>
                            Tag {tagTarget?.name}
                        </Text>
                        <TextInput
                            style={styles.modalInput}
                            placeholder="e.g. work, climbing"
                            value={tagInput}
                            onChangeText={setTagInput}
                            autoFocus
                            autoCapitalize="none"
                            onSubmitEditing={handleAddTag}
                            returnKeyType="done"
                        />
                        <View style={styles.modalActions}>
                            <TouchableOpacity
                                style={styles.modalButton}
                                onPress={closeTagModal}
                            >
                                <Text style={styles.modalButtonText}>
                                    Cancel
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[
                                    styles.modalButton,
                                    styles.modalButtonPrimary,
                                ]}
                                onPress={handleAddTag}
                            >
                                <Text
                                    style={[
                                        styles.modalButtonText,
                                        styles.modalButtonTextPrimary,
                                    ]}
                                >
                                    Add tag
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
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
    filterRow: {
        marginTop: 12,
    },
    filterRowContent: {
        gap: 8,
        paddingRight: 8,
    },
    filterChip: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 14,
        backgroundColor: "#F2F2F7",
    },
    filterChipActive: {
        backgroundColor: "#007AFF",
    },
    filterChipText: {
        fontSize: 14,
        fontWeight: "500",
        color: "#007AFF",
    },
    filterChipTextActive: {
        color: "#FFFFFF",
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
    tagRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 4,
        marginTop: 4,
    },
    tagChip: {
        paddingVertical: 2,
        paddingHorizontal: 8,
        borderRadius: 10,
        backgroundColor: "#E8F5E9",
    },
    tagChipText: {
        fontSize: 12,
        color: "#2E7D32",
        fontWeight: "500",
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
    saveButton: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 14,
        backgroundColor: "#007AFF",
    },
    saveButtonDisabled: {
        opacity: 0.5,
    },
    saveButtonText: {
        color: "#FFFFFF",
        fontSize: 14,
        fontWeight: "600",
    },
    addTagButton: {
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderRadius: 14,
        backgroundColor: "#F2F2F7",
    },
    addTagButtonText: {
        color: "#007AFF",
        fontSize: 14,
        fontWeight: "600",
    },
    modalBackdrop: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.4)",
        justifyContent: "center",
        alignItems: "center",
        padding: 24,
    },
    modalCard: {
        width: "100%",
        maxWidth: 340,
        backgroundColor: "#FFFFFF",
        borderRadius: 14,
        padding: 20,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: "600",
        marginBottom: 12,
        color: "#000000",
    },
    modalInput: {
        borderWidth: 1,
        borderColor: "#E5E5EA",
        borderRadius: 8,
        paddingVertical: 10,
        paddingHorizontal: 12,
        fontSize: 16,
        marginBottom: 16,
    },
    modalActions: {
        flexDirection: "row",
        justifyContent: "flex-end",
        gap: 8,
    },
    modalButton: {
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: 8,
    },
    modalButtonPrimary: {
        backgroundColor: "#007AFF",
    },
    modalButtonText: {
        fontSize: 15,
        color: "#007AFF",
        fontWeight: "600",
    },
    modalButtonTextPrimary: {
        color: "#FFFFFF",
    },
});
