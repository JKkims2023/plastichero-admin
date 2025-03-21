import AsyncStorage from '@react-native-async-storage/async-storage';

export async function setStorageData(key: string, value: string) {
    try {
        await AsyncStorage.setItem(key, value);
        return true;
    } catch (error) {
        console.error('Failed to save the data to the storage', error);
    }
    return false;
}
export async function getStorageData(key: string) {
    try {
        const value = await AsyncStorage.getItem(key);
        if (value !== null) {
            return value;
        }
    } catch (error) {
        console.error('Failed to fetch the data from storage', error);
    }
    return null;
}
export async function removeStorageData(key: string) {
    try {
        await AsyncStorage.removeItem(key);
        return true;
    } catch (error) {
        console.error('Failed to remove the data from storage', error);
    }
    return false;
}