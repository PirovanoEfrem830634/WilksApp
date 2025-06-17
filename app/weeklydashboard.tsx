import React, { useEffect, useState } from 'react';
import { View, ScrollView, Text, Dimensions, StyleSheet } from 'react-native';
import * as Animatable from 'react-native-animatable';
import { LineChart } from 'react-native-chart-kit';
import { Ionicons } from '@expo/vector-icons';
import { collection, getDocs, query, where, Timestamp } from 'firebase/firestore';
import { auth, db } from "../firebaseconfig";
import { getStartOfWeek, getEndOfWeek } from '../utils/dateutils';
import FontStyles from "../Styles/fontstyles";
import Colors from "../Styles/color";
import { LinearGradient } from "expo-linear-gradient";
import { format } from 'date-fns';
import BottomNavigation from "../app/bottomnavigationnew";

const formatWeekRange = (start: Date, end: Date): string => {
  const startStr = format(start, 'dd');
  const endStr = format(end, 'dd MMMM yyyy');
  return `Week of ${startStr}–${endStr}`;
  };

const WeeklyDashboard = () => {
  const [sleepData, setSleepData] = useState<number[]>([]);
  const [averageSleep, setAverageSleep] = useState<number>(0);
  const startOfWeek = getStartOfWeek();
  const endOfWeek = getEndOfWeek();
  const weekRange = formatWeekRange(startOfWeek, endOfWeek);
  const [symptomEntries, setSymptomEntries] = useState<any[]>([]);
  const [fatigueAverage, setFatigueAverage] = useState<number | null>(null);
  const [dietEntries, setDietEntries] = useState<any[]>([]);
  const [mealsCompleted, setMealsCompleted] = useState<number>(0);
  const [medLogs, setMedLogs] = useState<any[]>([]);
  const [missedCount, setMissedCount] = useState<number>(0);

  const fetchSleepData = async () => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    const startOfWeek = getStartOfWeek();
    const endOfWeek = getEndOfWeek();

    const q = query(
    collection(db, `users/${userId}/sleep`),
    where('dataInserimento', '>=', Timestamp.fromDate(startOfWeek)),
    where('dataInserimento', '<=', Timestamp.fromDate(endOfWeek))
    );
    const snapshot = await getDocs(q);
    const data: number[] = [];

    snapshot.forEach(doc => {
      const { durationHours } = doc.data();
      if (durationHours) data.push(durationHours);
    });

    setSleepData(data);
    const avg = data.reduce((a, b) => a + b, 0) / data.length || 0;
    setAverageSleep(parseFloat(avg.toFixed(2)));
  };

  const fetchSymptomData = async () => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    const q = query(
    collection(db, `users/${userId}/symptoms`),
    where('dataInserimento', '>=', Timestamp.fromDate(startOfWeek)),
    where('dataInserimento', '<=', Timestamp.fromDate(endOfWeek))
    );

    const snapshot = await getDocs(q);
    const entries: any[] = [];
    let fatigueSum = 0;
    let fatigueCount = 0;

    snapshot.forEach(doc => {
        const data = doc.data();
        entries.push(data);
        if (data.affaticamento !== undefined) {
        fatigueSum += Number(data.affaticamento);
        fatigueCount++;
        }
    });

    setSymptomEntries(entries);
    setFatigueAverage(fatigueCount > 0 ? fatigueSum / fatigueCount : null);
    };

    const fetchDietData = async () => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    const q = query(
    collection(db, `users/${userId}/diet`),
    where('dataInserimento', '>=', Timestamp.fromDate(startOfWeek)),
    where('dataInserimento', '<=', Timestamp.fromDate(endOfWeek))
    );

    const snapshot = await getDocs(q);
    const entries: any[] = [];
    let completedMeals = 0;

    snapshot.forEach(doc => {
        const data = doc.data();
        entries.push(data);
        if (data.colazione) completedMeals++;
        if (data.pranzo) completedMeals++;
        if (data.cena) completedMeals++;
    });

    setDietEntries(entries);
    setMealsCompleted(completedMeals);
    };

    const fetchMedicationData = async () => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    const q = query(
    collection(db, `users/${userId}/medications`),
    where('dataInserimento', '>=', Timestamp.fromDate(startOfWeek)),
    where('dataInserimento', '<=', Timestamp.fromDate(endOfWeek))
    );

    const snapshot = await getDocs(q);
    const logs: any[] = [];
    let missed = 0;

    snapshot.forEach(doc => {
        const data = doc.data();
        logs.push(data);
        if (data.assunto === false) missed++;
    });

    setMedLogs(logs);
    setMissedCount(missed);
    };

  useEffect(() => {
    fetchSleepData();
    fetchSymptomData();
    fetchDietData();
    fetchMedicationData();
  }, []);

  const screenWidth = Dimensions.get('window').width;

  return (
    <View style={styles.container}>
    <ScrollView style={styles.container}>
       <LinearGradient
        colors={["#80E4D9", Colors.light1]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.gradientBackground}
      />

      <View style={styles.mainHeader}>
        <View style={styles.iconWrapper}>
          <Ionicons name="bar-chart" size={48} color={Colors.mint} />
        </View>
        <Text style={FontStyles.variants.mainTitle}>Weekly Summary</Text>
        <Text style={FontStyles.variants.sectionTitle}>
        {weekRange}
        </Text>
      </View>

      <Animatable.View animation="fadeInUp" delay={100} style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="bed" size={20} color={Colors.green} />
          <Text style={[FontStyles.variants.sectionTitle, { color: Colors.green }]}>Sleep</Text>
        </View>
        <Text style={[FontStyles.variants.dataValue, styles.cardValue]}>{averageSleep} hr</Text>
        <Text style={FontStyles.variants.cardDescription}>Avg. Time Asleep</Text>
        {sleepData.length > 0 ? (
          <LineChart
            data={{
              labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
              datasets: [{ data: sleepData }]
            }}
            width={screenWidth * 0.85}
            height={140}
            chartConfig={{
              backgroundColor: '#fff',
              backgroundGradientFrom: '#fff',
              backgroundGradientTo: '#fff',
              decimalPlaces: 1,
              color: () => '#00C8B3',
              labelColor: () => '#848484',
              propsForDots: {
                r: '3',
                strokeWidth: '2',
                stroke: '#00C8B3'
              }
            }}
            bezier
            style={styles.chart}
          />
        ) : (
          <Text style={styles.noData}>No sleep data available</Text>
        )}
      </Animatable.View>

      <Animatable.View animation="fadeInUp" delay={200} style={styles.card}>
        <View style={styles.cardHeader}>
            <Ionicons name="pulse" size={20} color={Colors.blue} />
            <Text style={[FontStyles.variants.sectionTitle , { color: Colors.blue }]}>Symptoms</Text>
        </View>
        <Text style={[FontStyles.variants.dataValue, styles.cardValue]}>
            {symptomEntries.length} entries
        </Text>
        <Text style={FontStyles.variants.cardDescription}>
            Avg. Fatigue: {fatigueAverage ? fatigueAverage.toFixed(1) : '—'}
        </Text>
      </Animatable.View>

      <Animatable.View animation="fadeInUp" delay={300} style={styles.card}>
        <View style={styles.cardHeader}>
            <Ionicons name="nutrition" size={20} color={Colors.orange} />
            <Text style={[FontStyles.variants.sectionTitle, { color: Colors.orange }]}>Diet</Text>
        </View>
        <Text style={[FontStyles.variants.dataValue, styles.cardValue]}>
            {mealsCompleted} meals
        </Text>
        <Text style={FontStyles.variants.cardDescription}>
            {dietEntries.length} days tracked
        </Text>
      </Animatable.View>

      <Animatable.View animation="fadeInUp" delay={400} style={styles.card}>
        <View style={styles.cardHeader}>
            <Ionicons name="medkit" size={20} color={Colors.turquoise} />
            <Text style={[FontStyles.variants.sectionTitle, { color: Colors.turquoise }]}>
            Medications
            </Text>
        </View>
        <Text style={[FontStyles.variants.dataValue, styles.cardValue]}>
            {medLogs.length - missedCount} / {medLogs.length} taken
        </Text>
        <Text style={FontStyles.variants.cardDescription}>
            {missedCount > 0 ? `${missedCount} missed dose(s)` : 'All doses taken'}
        </Text>
      </Animatable.View>

      {/* Altre sezioni possono essere aggiunte qui come sintomi, dieta, farmaci ecc. */}

    </ScrollView>
    <BottomNavigation />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    paddingHorizontal: 20,
    marginBottom: 20,
    color: '#00C8B3'
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 10,
    elevation: 2
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6
  },
  cardValue: {
    fontSize: 22,
    marginVertical: 4
  },
  chart: {
    marginTop: 10,
    borderRadius: 10
  },
  noData: {
    textAlign: 'center',
    color: '#aaa',
    marginTop: 20
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

export default WeeklyDashboard;
