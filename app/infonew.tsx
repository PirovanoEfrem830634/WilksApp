import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  LayoutAnimation,
  Platform,
  UIManager,
  Animated,
  TextInput,
} from "react-native";
import { ChevronDown, ChevronUp, Search } from "lucide-react-native";
import { useRouter } from "expo-router";
import BottomNavigation from "../components/bottomnavigationnew";
import * as Animatable from "react-native-animatable";
import { Ionicons } from "@expo/vector-icons";
import Colors from "../Styles/color";
import FontStyles from "../Styles/fontstyles";
import { LinearGradient } from "expo-linear-gradient";
import { BriefcaseMedical, Info } from "lucide-react-native";

if (Platform.OS === "android") {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

const symptoms = [
  {
    key: "debolezzaMuscolare",
    icon: "barbell",
    title: "Debolezza muscolare",
    description:
      "Nella miastenia gravis la debolezza muscolare deriva da una comunicazione alterata tra nervi e muscoli. Peggiora con l’uso e migliora con il riposo.",
    actions: [
      "Evita sforzi eccessivi e sollevamenti pesanti",
      "Fai pause frequenti per riposare",
      "Avvisa il neurologo se i sintomi peggiorano",
    ],
  },
  {
    key: "disfagia",
    icon: "restaurant",
    title: "Difficoltà di deglutizione",
    description:
      "I problemi di deglutizione (disfagia) possono influire sull’alimentazione e aumentare il rischio di aspirazione.",
    actions: [
      "Preferisci cibi morbidi e piccoli bocconi",
      "Evita di sdraiarti subito dopo i pasti",
      "Valuta una consulenza logopedica se necessario",
    ],
  },
  {
    key: "disartria",
    icon: "mic",
    title: "Difficoltà nel parlare",
    description:
      "La voce può diventare nasale o l’eloquio può risultare impastato durante i periodi di affaticamento.",
    actions: [
      "Parla lentamente e in modo chiaro",
      "Fai pause frequenti per riposare",
      "Informa lo specialista se i sintomi persistono",
    ],
  },
  {
    key: "ptosi",
    icon: "eye",
    title: "Ptosi (palpebre cadenti)",
    description:
      "La ptosi è spesso uno dei primi segni della miastenia gravis, e può essere più evidente la sera.",
    actions: [
      "Prova a tenere la testa leggermente sollevata durante il riposo",
      "Usa impacchi freschi per alleviare l’affaticamento",
      "Monitora l’andamento con foto giornaliere",
    ],
  },
  {
    key: "diplopia",
    icon: "glasses",
    title: "Visione doppia",
    description:
      "La visione doppia (diplopia) può comparire e scomparire in base all’affaticamento muscolare.",
    actions: [
      "Evita lettura o schermi durante le riacutizzazioni",
      "Usa una benda alternandola tra i due occhi",
      "Parla con l’oculista di eventuali lenti correttive",
    ],
  },
  {
    key: "difficoltaRespiratorie",
    icon: "cloud",
    title: "Difficoltà respiratorie",
    description:
      "La debolezza dei muscoli respiratori può diventare seria e richiede attenzione immediata se peggiora.",
    actions: [
      "Siediti con il busto eretto per facilitare la respirazione",
      "Evita ambienti con aria di scarsa qualità",
      "Rivolgiti al pronto soccorso se la respirazione diventa faticosa",
    ],
  },
];

export default function SymptomInfo() {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const toggleCard = (key: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(expanded === key ? null : key);
  };

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  const filteredSymptoms = symptoms.filter((symptom) =>
    symptom.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <View style={styles.wrapper}>
      <Animatable.View
        animation="fadeInUp"
        duration={500}
        style={styles.scrollWrapper}
      >
        <Animated.View style={[styles.headerContainer, { opacity: fadeAnim }]}>
          <LinearGradient
            colors={["#E3D7FF", Colors.light1]}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={styles.gradientBackground}
          />
          <View style={styles.mainHeader}>
            <View style={styles.iconWrapper}>
              <Info size={48} color={Colors.purple} />
            </View>
            <Text style={FontStyles.variants.mainTitle}>Informazioni sui sintomi</Text>
            <Text style={FontStyles.variants.sectionTitle}>
              Tocca una tab per vedere i consigli
            </Text>
          </View>
        </Animated.View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.searchContainer}>
            <Search
              size={20}
              color={Colors.gray3}
              style={{ marginRight: 8 }}
            />
            <TextInput
              style={FontStyles.variants.smallLabelBold}
              placeholder="Cerca un sintomo..."
              value={searchTerm}
              onChangeText={setSearchTerm}
              placeholderTextColor={Colors.gray3}
            />
          </View>

          {filteredSymptoms.map((symptom) => {
            const isExpanded = expanded === symptom.key;
            return (
              <Animated.View key={symptom.key} style={{ opacity: fadeAnim }}>
                <Pressable
                  onPress={() => toggleCard(symptom.key)}
                  style={[styles.card, isExpanded && styles.cardExpanded]}
                >
                  <View style={styles.cardHeader}>
                    <View style={styles.iconTitleContainer}>
                      <Ionicons
                        name={symptom.icon as any}
                        size={20}
                        color={Colors.purple}
                      />
                      <Text style={FontStyles.variants.bodySemibold}>
                        {symptom.title}
                      </Text>
                    </View>
                    {isExpanded ? (
                      <ChevronUp size={22} color={Colors.gray3} />
                    ) : (
                      <ChevronDown size={22} color={Colors.gray3} />
                    )}
                  </View>

                  <Text style={FontStyles.variants.cardDescription}>
                    {symptom.description}
                  </Text>

                  {isExpanded && (
                    <View style={styles.actionContainer}>
                      <Text style={styles.actionTitle}>Cosa puoi fare:</Text>
                      {symptom.actions.map((item, idx) => (
                        <Text key={idx} style={styles.actionItem}>
                          • {item}
                        </Text>
                      ))}
                    </View>
                  )}
                </Pressable>
              </Animated.View>
            );
          })}
        </ScrollView>
      </Animatable.View>

      <BottomNavigation />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: Colors.light1,
  },
  scrollWrapper: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  headerContainer: {
    marginBottom: 20,
    alignItems: "center",
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.gray1,
    marginBottom: 6,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 15,
    color: Colors.gray3,
    textAlign: "center",
    marginBottom: 10,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.white,
    borderRadius: 12,
    borderColor: Colors.gray3,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: Colors.gray1,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardExpanded: {
    borderColor: Colors.purple,
    borderWidth: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  iconTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.gray1,
  },
  description: {
    fontSize: 15,
    color: Colors.gray2,
    lineHeight: 20,
  },
  actionContainer: {
    marginTop: 10,
  },
  actionTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.gray1,
    marginTop: 5,
    marginBottom: 4,
  },
  actionItem: {
    fontSize: 14,
    color: Colors.gray1,
    marginLeft: 8,
    marginBottom: 4,
  },
  gradientBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 160,
    zIndex: -1,
  },
  mainHeader: {
    alignItems: "center",
    marginTop: 32,
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  iconWrapper: {
    borderRadius: 60,
    padding: 5,
    marginBottom: 10,
  },
});
