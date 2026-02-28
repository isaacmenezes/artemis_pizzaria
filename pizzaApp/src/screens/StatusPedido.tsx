import React, { useEffect, useState, useCallback } from "react";
import { View, Text, ActivityIndicator, StyleSheet, ScrollView, TouchableOpacity, LayoutAnimation, Platform, UIManager, Alert } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../routes/RootStackParamList";
import BackButton from "../components/backButton";
import Divider from "../components/divider";
import Table from "../components/status/table";
import { useTable } from "../contexts/TableContext";
import axios from "axios";

type Props = NativeStackScreenProps<RootStackParamList, "StatusPedido">;

interface Product {
  name: string;
  price: string | number | undefined;
  description?: string;
  banner?: string;
}

interface Item {
  product: Product | null | undefined;
  amount: number;
}
interface Order {
  id: string | number;
  draft: boolean;
  status: string | boolean;
  items: Item[];
  [key: string]: any;
}


const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3333";
const API_HOSTS = [API_BASE_URL];
const POLLING_INTERVAL_MS = 3000;

// Paleta de Cores (Pizzaria Artemis)
const COLORS = {
  PRIMARY: '#9A1105',
  SECONDARY: '#1A1F3F',
  BACKGROUND: '#FAF6ED',
  WHITE: '#FFFFFF',
  BLACK: '#000000',
  ACCENT: '#FF9898',
};

async function fetchFromAnyHost(path: string) {
  let lastErr: any = null;
  for (const host of API_HOSTS) {
    try {
      const res = await axios.get(`${host}${path}`, { timeout: 5000 });
      return res;
    } catch (err) {
      lastErr = err;
    }
  }
  throw lastErr;
}

async function getTableIdByNumber(tableNumber: string | number): Promise<string | null> {
  const tableRes = await fetchFromAnyHost(`/table/find?number=${tableNumber}`);
  const tableData = tableRes?.data ?? {};
  const foundId = tableData.id ?? tableData.table?.id;

  return foundId ? String(foundId) : null;
}

async function getOrdersByTableId(tableId: string | number): Promise<any[]> {
  const ordersRes = await fetchFromAnyHost(`/table/${tableId}/orders`);
  return ordersRes?.data ?? [];
}


const isBeingDelivered = (order: Order): boolean => {
  return order.status === true || order.status === 'indo até vc';
};

const getDisplayStatusText = (order: Order): string => {
  if (!order) {
    return '';
  }

  if (order.draft === true) {
    return 'rascunho';
  }

  if (isBeingDelivered(order)) {
    return 'indo até vc';
  }
  return 'preparando';
};

// --- COMPONENTE PRINCIPAL ---

export default function StatusPedido({ navigation }: Props) {
  const { tableNumber, tableId } = useTable();
  const [loading, setLoading] = useState(true);
  const [rawOrders, setRawOrders] = useState<Order[]>([]);

  const [hiddenOrderIds, setHiddenOrderIds] = useState<Set<string | number>>(new Set());

  const [expandedOrderId, setExpandedOrderId] = useState<string | number | null>(null);

  // LÓGICA DE FILTRAGEM: Remove draft=true, pedidos em entrega E items já ocultos.
  const activeOrders = rawOrders.filter(order =>
    !hiddenOrderIds.has(order.id) &&
    !order.draft &&
    !isBeingDelivered(order)
  );

  // Alterna o estado de expansão do card
  const toggleExpand = useCallback((orderId: string | number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedOrderId(prevId => prevId === orderId ? null : orderId);
  }, []);

  // Função para navegar de volta ao Menu (Home)
  const navigateToHome = useCallback(() => {
    navigation.navigate("Home");
  }, [navigation]);

  useEffect(() => {
    async function loadOrders() {
      if (!tableNumber && !tableId) {
        setLoading(false);
        return;
      }

      try {
        let currentTableId: string | number | null = tableId;

        if (!currentTableId && tableNumber) {
          currentTableId = await getTableIdByNumber(tableNumber);
        }

        if (!currentTableId) {
          console.error("Mesa não encontrada.");
          return;
        }

        const allOrders = await getOrdersByTableId(currentTableId);

        if (!Array.isArray(allOrders) || allOrders.length === 0) {
          setRawOrders([]);
          return;
        }

        let shouldHideOrders: (string | number)[] = [];

        // Mapeamento e tipagem segura
        const typedOrders: Order[] = allOrders.map((order: any) => {
          const items = Array.isArray(order.items) ? order.items : [];
          const typedOrder: Order = {
            items: items,
            ...order,
            draft: !!order.draft,
          };

          // Se o pedido está em entrega E não é rascunho, ele deve ser adicionado ao hiddenOrderIds (para sumir da lista ativa).
          if (isBeingDelivered(typedOrder) && !typedOrder.draft) {
            shouldHideOrders.push(typedOrder.id);
          }

          return typedOrder;
        }) as Order[];


        if (shouldHideOrders.length > 0) {
          setHiddenOrderIds(prevIds => {
            const newIds = new Set(prevIds);
            shouldHideOrders.forEach(id => newIds.add(id));
            return newIds;
          });
        }

        setRawOrders(typedOrders);

      } catch (err: any) {
        console.error("Erro no polling:", err);
        setRawOrders([]);
      } finally {
        setLoading(false);
      }
    }

    loadOrders();
    const pollInterval = setInterval(loadOrders, POLLING_INTERVAL_MS);

    // Retorna a função de cleanup
    return () => clearInterval(pollInterval);
  }, [tableNumber, tableId, navigation]);

  

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.PRIMARY} />
        <Text style={{ marginTop: 10, color: COLORS.SECONDARY }}>Carregando pedidos...</Text>
      </View>
    );
  }

  const sentOrdersCount = activeOrders.length;


  const allActiveConcluded = rawOrders.length > 0 && sentOrdersCount === 0;

  // Renderiza a tela de conclusão
  if (allActiveConcluded) {
    return (
      <View style={styles.container}>
        <BackButton />

        <View style={styles.center}>
          {/* CARD DE SUCESSO - Mensagem de conclusão */}
          <View style={styles.completionCard}>
            <Text style={styles.completionTextTitle}>
              Todos os pedidos da mesa {tableNumber} foram concluídos!
            </Text>
            <Text style={styles.completionTextSubtitle}>
              Obrigado por sua preferência. Você pode realizar um novo pedido a qualquer momento.
            </Text>

            <TouchableOpacity
              style={styles.newOrderButton}
              onPress={navigateToHome} 
            >
              <Text style={styles.newOrderButtonText}>
                Realizar novos pedidos
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }


  if (rawOrders.length === 0) {
    return (
      <View style={styles.container}>
        <BackButton />

        <View style={styles.center}>
          <Text style={{ fontSize: 18, color: COLORS.SECONDARY }}>Nenhum pedido ativo encontrado para a mesa {tableNumber}.</Text>
          <Text style={{ fontSize: 16, color: COLORS.SECONDARY, marginTop: 10 }}>Aguardando o primeiro pedido...</Text>

          <TouchableOpacity
            style={[styles.newOrderButton, styles.singleButton]}
            onPress={navigateToHome}
          >
            <Text style={styles.newOrderButtonText}>
              Fazer novo pedido
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <BackButton />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          Status dos Pedidos da Mesa {tableNumber}
        </Text>
        <Table />
      </View>
      <Divider />

      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.listTitle}>
          Pedidos em Preparação ({sentOrdersCount} {sentOrdersCount === 1 ? 'item' : 'itens'})
        </Text>

        {activeOrders.map((order, index) => {
          const statusLabel = getDisplayStatusText(order);
          const isExpanded = expandedOrderId === order.id;

          if (!statusLabel) return null;

          const isPreparing = statusLabel === 'preparando';

          return (
            <TouchableOpacity
              key={order.id}
              style={[
                styles.orderCard,
                isPreparing && styles.preparingCard,
                isExpanded && styles.expandedCard,
              ]}
              onPress={() => toggleExpand(order.id)}
              activeOpacity={0.8}
            >

              <View style={styles.orderHeader}>
                <Text style={[styles.orderTitle]}>
                  Pedido #{index + 1}
                </Text>

                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  {isPreparing && (
                    <Text style={styles.preparingBadge}>
                      ENVIADO
                    </Text>
                  )}
                  <Text style={styles.expandIcon}>{isExpanded ? '▲' : '▼'}</Text>
                </View>
              </View>

              {/* Status exibido */}
              <View style={styles.statusTextView}>
                <Text style={[styles.statusText, styles.statusTextPreparing]}>
                  Status: PREPARANDO
                </Text>
              </View>

              {/* DETALHES EXPANDIDOS (Aparece ao Tocar) */}
              {isExpanded && (
                <View style={styles.detailsContainer}>
                  <Text style={styles.detailsTitle}>Itens do Pedido:</Text>

                  {Array.isArray(order.items) && order.items.length > 0 ? (
                    order.items.map((item, itemIndex) => {

                      const productName = item.product?.name ?? 'Produto Indisponível';

                      const rawPrice = item.product?.price;
                      let productPrice = 0;

                      if (typeof rawPrice === 'string') {
                        productPrice = parseFloat(rawPrice.replace(',', '.')) || 0;
                      } else if (typeof rawPrice === 'number') {
                        productPrice = rawPrice;
                      }

                      return (
                        <View key={itemIndex} style={{ marginBottom: 5 }}>
                          <Text style={styles.itemText}>
                            {item.amount}x {productName} (R$ {productPrice.toFixed(2)})
                          </Text>
                        </View>
                      );
                    })
                  ) : (
                    <Text style={styles.itemText}>Nenhum item detalhado disponível.</Text>
                  )}

                  <Divider />

                </View>
              )}
            </TouchableOpacity>
          );
        })}

        <Text style={styles.totalText}>
          Total de pedidos em preparação: {sentOrdersCount}
        </Text>


        <TouchableOpacity
          style={[styles.newOrderButton, styles.listButton]}
          onPress={navigateToHome}
        >
          <Text style={styles.newOrderButtonText}>
            Fazer novo pedido
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.BACKGROUND,
    padding: 20,
  },
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: COLORS.BACKGROUND,
  },
  scrollContent: {
    paddingBottom: 20,
    paddingHorizontal: 10,
  },
  header: {
    marginBottom: 10,
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.SECONDARY,
    marginBottom: 10,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.SECONDARY,
    marginTop: 10,
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    paddingBottom: 5,
  },
  // --- ESTILOS PARA TELA DE CONCLUSÃO ---
  completionCard: {
    backgroundColor: '#ffffffff', 
    padding: 25,
    borderRadius: 15,
    marginHorizontal: 20,
    alignItems: 'center',
    shadowColor: COLORS.BLACK,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
    width: '90%',
    maxWidth: 400, 
  },
  completionTextTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.BLACK,
    textAlign: 'center',
    marginBottom: 10,
  },
  completionTextSubtitle: {
    fontSize: 16,
    color: '#424242ff',
    textAlign: 'center',
    marginBottom: 20,
  },
  
  newOrderButton: {
    marginTop: 15,
    paddingVertical: 14,
    paddingHorizontal: 30,
    backgroundColor: COLORS.PRIMARY, 
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: COLORS.PRIMARY,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
    elevation: 8,
    width: '100%',
  },
  
  listButton: {
    marginTop: 20, 
    marginBottom: 30,
    width: '90%',
    alignSelf: 'center',
  },
  singleButton: {
    marginTop: 30,
    width: '80%',
    maxWidth: 300,
  },
  newOrderButtonText: {
    color: COLORS.WHITE,
    fontWeight: 'bold',
    fontSize: 15,
    textTransform: 'uppercase',
  },

  orderCard: {
    marginBottom: 15,
    padding: 15,
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    shadowColor: COLORS.BLACK,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  expandedCard: {
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#CCC',
  },
  
  preparingCard: {
    backgroundColor:'#ffffffff',
    borderColor: COLORS.PRIMARY,
    borderLeftWidth: 5,
  },
  preparingBadge: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.PRIMARY,
    backgroundColor: '#ffbbbbff',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 5,
    marginLeft: 10,
  },
  // Futuro Estilo para pedidos "indo até vc
  goingCard: {
    backgroundColor: '#1a0f0fff',
    borderColor: COLORS.PRIMARY,
    borderLeftWidth: 5,
  },
  goingTitle: {
    color: COLORS.PRIMARY,
  },
  goingBadge: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.WHITE,
    backgroundColor: COLORS.PRIMARY,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 5,
    marginLeft: 10,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  orderTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.SECONDARY,
  },
  expandIcon: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.SECONDARY,
    marginLeft: 10,
  },
  statusTextView: {
    marginTop: 5,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 6,
    backgroundColor: COLORS.BACKGROUND,
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  statusText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  statusTextPreparing: {
    color: COLORS.SECONDARY,
  },
  statusTextGoing: {
    color: COLORS.PRIMARY,
  },
  // Estilos para os Detalhes Expandidos
  detailsContainer: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  detailsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.SECONDARY,
    marginBottom: 5,
  },
  itemText: {
    fontSize: 14,
    color: COLORS.SECONDARY,
    marginBottom: 3,
  },
  totalText: {
    marginTop: 25,
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.SECONDARY,
    textAlign: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  }
});
