import { View, Text, TouchableOpacity, FlatList } from "react-native";
import { Link } from "expo-router";
import { Bell, Briefcase, Calendar, ClipboardList, User } from "lucide-react-native";

const data = [
  { id: "1", title: "Routine Treatments", description: "Needs updating", icon: ClipboardList, link: "/explore" },
  { id: "2", title: "Rescue Treatments", description: "Needs updating", icon: ClipboardList, link: "/explore" },
  { id: "3", title: "Side Effects", description: "Needs updating", icon: Bell, link: "/explore" },
  { id: "4", title: "Work or Studies", description: "Needs updating", icon: Briefcase, link: "/explore" },
  { id: "5", title: "Healthcare Visits", description: "Needs updating", icon: Calendar, link: "/explore" },
];

export default function TrackerPage() {
  return (
    <View className="flex-1 bg-light p-4">
      
      {/* Header */}
      <Text className="text-primary text-2xl font-montserrat-bold mb-4">
        Tracker Overview
      </Text>

      <Text className="text-secondary text-base mb-6">
        Keep your records up to date for a better experience.
      </Text>

      {/* Card List */}
      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Link href={item.link} asChild>
            <TouchableOpacity className="bg-white p-4 rounded-2xl shadow-md mb-4 flex-row justify-between items-center">
              
              <View className="flex-row items-center">
                <item.icon size={24} color="#2C3E50" />
                <View className="ml-3">
                  <Text className="text-primary text-lg font-montserrat-bold">
                    {item.title}
                  </Text>
                  <Text className="text-secondary text-sm">
                    {item.description}
                  </Text>
                </View>
              </View>

              {/* Notification Indicator */}
              <View className="w-5 h-5 rounded-full bg-secondary justify-center items-center">
                <Text className="text-light text-xs font-opensans-regular">!</Text>
              </View>

            </TouchableOpacity>
          </Link>
        )}
      />

      {/* Bottom Navigation */}
      <View className="flex-row justify-around p-4 bg-white rounded-t-2xl shadow-md">
        <Link href="/explore" asChild>
          <TouchableOpacity className="items-center">
            <ClipboardList size={24} color="#2C3E50" />
            <Text className="text-primary mt-1 text-sm">Tracker</Text>
          </TouchableOpacity>
        </Link>

        <Link href="/explore" asChild>
          <TouchableOpacity className="items-center">
            <ClipboardList size={24} color="#5DADE2" />
            <Text className="text-secondary mt-1 text-sm">Surveys</Text>
          </TouchableOpacity>
        </Link>

        <Link href="/explore" asChild>
          <TouchableOpacity className="items-center">
            <Calendar size={24} color="#A9CCE3" />
            <Text className="text-accent mt-1 text-sm">Knowledge</Text>
          </TouchableOpacity>
        </Link>

        <Link href="/explore" asChild>
          <TouchableOpacity className="items-center relative">
            <User size={24} color="#2C3E50" />
            <Text className="text-primary mt-1 text-sm">Profile</Text>
            <View className="absolute top-0 right-0 w-3 h-3 bg-secondary rounded-full border-2 border-light" />
          </TouchableOpacity>
        </Link>
      </View>
    </View>
  );
}
