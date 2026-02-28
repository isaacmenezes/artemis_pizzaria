import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTable } from "../contexts/TableContext";
import axios from 'axios';

// --- DEFINIÇÕES DE TIPOS E VARIÁVEIS DE API ---

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3333";
const API_HOSTS = [API_BASE_URL]; 

const API_TIMEOUT_MS = 15000;

interface Product {
  name: string;
  price: string | number | undefined;
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

// --- FUNÇÕES DE API ---
async function fetchFromAnyHost(path: string) {
  let lastErr: any = null;
  for (const host of API_HOSTS) {
    try {

      const res = await axios.get(`${host}${path}`, { timeout: API_TIMEOUT_MS });
      return res;
    } catch (err) {
      lastErr = err;
      if (axios.isAxiosError(err)) {
        console.error(`Falha no Host ${host}. Código Axios: ${err.code}. Mensagem: ${err.message}`);
      } else {
        console.error(`Falha no Host ${host}. Erro desconhecido:`, err);
      }
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

const useActiveOrdersLogic = () => {
  const { tableNumber, tableId } = useTable();
  const [loading, setLoading] = useState(true);
  const [rawOrders, setRawOrders] = useState<Order[]>([]);
  const [hiddenOrderIds, setHiddenOrderIds] = useState<Set<string | number>>(new Set());

  // Lógica de Filtragem de Pedidos ATIVOS
  const activeOrders = useMemo(() => {
    return rawOrders.filter(order =>
      !hiddenOrderIds.has(order.id) &&
      !order.draft &&
      !isBeingDelivered(order)
    );
  }, [rawOrders, hiddenOrderIds]);

  const hasActiveOrders = activeOrders.length > 0;

  useEffect(() => {
    // Função para carregar os pedidos UMA VEZ
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

        let shouldHideOrders: (string | number)[] = [];

        const typedOrders: Order[] = (Array.isArray(allOrders) ? allOrders : []).map((order: any) => {
          const typedOrder: Order = {
            items: Array.isArray(order.items) ? order.items : [],
            ...order,
            draft: !!order.draft,
          };

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
        console.error("Erro ao carregar pedidos (execução única):", err);
        setRawOrders([]);
      } finally {
        setLoading(false);
      }
    }

    loadOrders();

  }, [tableNumber, tableId]); 

  return { loading, hasActiveOrders };
};


interface PedidoAtivoFABProps {
  onClose?: () => void;
}

const PedidoAtivoFAB: React.FC<PedidoAtivoFABProps> = ({ onClose }) => {
  const navigation = useNavigation();

  // 1. Usa o hook interno para obter o estado
  const { hasActiveOrders, loading } = useActiveOrdersLogic();

  // 2. Condição de renderização: O botão SÓ aparece se NÃO estiver carregando E houver pedidos ativos (não-draft).
  if (loading || !hasActiveOrders) {
    return null;
  }

  const handlePress = () => {
    navigation.navigate('StatusPedido' as never);
  };

  return (
    <TouchableOpacity
      style={styles.floatingButton}
      onPress={handlePress}
    >
      {/* Ícone (vazio no original) */}
      <View style={styles.iconContainer}>
        <Text style={styles.initialText}>{'P'}</Text>
      </View>

      {/* Texto de alerta */}
      <Text style={styles.alertText}>Pedidos Ativo</Text>

      {/* Botão de fechar opcional */}
      {onClose && (
        <TouchableOpacity style={styles.closeButton} onPress={(e) => {
          e.stopPropagation();
          onClose();
        }}>
          <Text style={styles.closeText}>X</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  floatingButton: {
    position: 'absolute',
    bottom: 80,
    right: 20,
    zIndex: 10,

    backgroundColor: '#CC0000',
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 15,
    borderRadius: 30,
    height: 50,

    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  iconContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    marginLeft: 5,
  },
  initialText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  alertText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  closeButton: {
    marginLeft: 10,
    padding: 5,
  },
  closeText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  }
});

export default PedidoAtivoFAB;