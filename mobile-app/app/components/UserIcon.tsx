import { Image, StyleSheet, Pressable } from "react-native"
import * as ImagePicker from "expo-image-picker"
type UserIconProps = {
    imageUri: string | null;
    setImage: (uri: string) => void;
};

const defaultAvatar = require('../../assets/images/Avatar.png');


export default function UserIcon({ imageUri, setImage }: UserIconProps) {

    const handlePress = async () => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (permissionResult.granted === false) {
            console.log("Permission to access media library is required!");
            return;
        }

        let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
    }

    const imageSource = imageUri ? { uri: imageUri } : defaultAvatar;

    return (<Pressable onPress={handlePress} style={styles.UserIconContainer}>
        <Image style={styles.UserIconImage} source={imageSource} />
    </Pressable>)
}

const styles = StyleSheet.create({
    UserIconContainer: {
        paddingRight: 20,
    },
    UserIconImage: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#E5E5EA",
    }
})