import React, { useState, useEffect } from "react"
import { Button, Image, ScrollView, StyleSheet, View, Text, ActivityIndicator  } from "react-native"
import * as ImagePicker from "expo-image-picker"
import axios from "axios"
import { API_URL } from '@env';

export default function App() {
  const [image, setImage] = useState(null)
  const [translatedText, setTranslatedText] = useState("")
  const [loading, setLoading] = useState(false);

  const requestPermissions = async () => {
    const cameraPermission = await ImagePicker.requestCameraPermissionsAsync()
    const mediaLibraryPermission =
      await ImagePicker.requestMediaLibraryPermissionsAsync()

    if (
      cameraPermission.status !== "granted" ||
      mediaLibraryPermission.status !== "granted"
    ) {
      alert(
        "Desculpe, precisamos de permissões de câmera e galeria para fazer isso funcionar!"
      )
      return false
    }

    return true
  }

  useEffect(() => {
    requestPermissions()
  }, [])

  const takePicture = async () => {
    const hasPermissions = await requestPermissions()
    if (!hasPermissions) {
      return
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [3, 3],
      quality: 1,
    })

    if (!result.canceled) {
      setImage(result.assets[0].uri)
    }
  }

  const pickImage = async () => {
    const hasPermissions = await requestPermissions()
    if (!hasPermissions) {
      return
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [3, 3],
      quality: 1,
    })

    if (!result.canceled) {
      setImage(result.assets[0].uri)
    }
  }

  const translateImage = async () => {
    if (image) {
        setLoading(true);
      const formData = new FormData()
      formData.append("image", {
        uri: image,
        type: "image/jpeg",
        name: "image.jpg",
      })

      try {
        const response = await axios.post(
          API_URL+"/translate",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        )
        if (response.status !== 200) {
          console.error("Erro ao traduzir imagem")
          return
        }
        setTranslatedText(response.data)
      } catch (error) {
        console.error(error)
      }
      setLoading(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.innerContainer}>
        <Text style={styles.title}>Traduzir Inglês para Português</Text>
        <View style={styles.buttonContainer}>
          <Button title='Selecionar Foto' onPress={pickImage} color='#6a5acd' />
          <Button title='Tirar Foto' onPress={takePicture} color='#20b2aa' />
        </View>
        {image && (
          <>
            <Image source={{ uri: image }} style={styles.image} />
            <Button title='Traduzir' onPress={translateImage} color='#ff6347' />
          </>
        )}
        {loading && (
          <ActivityIndicator size="large" color="#0000ff" />
        )}
        {translatedText ? (
          <View style={styles.translationContainer}>
            <Text style={styles.translationTitle}>Texto Traduzido:</Text>
            <Text style={styles.translatedText}>{translatedText}</Text>
          </View>
        ) : null}
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    backgroundColor: "#f0f8ff",
  },
  innerContainer: {
    alignItems: "center",
    margin: 20,
  },
  title: {
    marginTop: 20,
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#483d8b",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginBottom: 20,
  },
  image: {
    width: 300,
    height: 300,
    borderRadius: 15,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5
  },
  translationContainer: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "#e6e6fa",
    borderRadius: 10,
    width: "100%",
  },
  translationTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#483d8b",
    marginBottom: 10,
  },
  translatedText: {
    fontSize: 16,
    color: "#000",
  },
})
