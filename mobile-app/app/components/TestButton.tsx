import { Button, Alert } from "react-native";
import { insertContact } from "../../lib";

export default function TestButton() {
    return (
        <Button
            title="Test insertContact"
            onPress={async () => {
                try {
                    const doc = await insertContact({
                        userId: "user_1",
                        appleContactId: `test-${Date.now()}`,
                        tags: ["soft-test"],
                        notes: "hello from mobile",
                    });
                    Alert.alert("Inserted", doc._id);
                } catch (e: any) {
                    Alert.alert("Error", e.message);
                }
            }}
        />
    );
}
