import axios from "axios";
let { REACT_APP_API_URL } = process.env;
const instance = axios.create({
  withCredentials: true,
  baseURL: REACT_APP_API_URL,
});

export const API = {
  async downloadPDF(packingSlipId, orderNumber, dateCreated) {
    try {
      const response = await instance.post("/packingSlips/pdf", {
        packingSlipId,
        orderNumber,
        dateCreated,
      });
      return response.data;
    } catch (error) {
      console.error("downloadPDF", error);
      throw new Error(
        error?.response?.data ?? "An error occurred downloading PDF"
      );
    }
  },

  async downloadShipmentPDF(shipmentInfo) {
    try {
      const res = await instance.post("/shipments/pdf", shipmentInfo);
      return res.data;
    } catch (error) {
      console.error("downloadShipmentPDF", error);
      throw new Error(
        error?.response?.data ?? "An error occurred downloading PDF"
      );
    }
  },

  async getPackingQueue() {
    try {
      const response = await instance.get("/workOrders/packingQueue");
      return response.data;
    } catch (error) {
      console.error("getPackingQueue", error);
      throw new Error(
        error?.response?.data ?? "An error occurred getting packing queue"
      );
    }
  },

  async getAllWorkOrders() {
    try {
      const response = await instance.get("/workOrders");
      return response.data;
    } catch (error) {
      console.error("getAllWorkOrders", error);
      throw new Error(
        error?.response?.data ?? "An error occurred getting all word orders"
      );
    }
  },

  async createPackingSlip(items, customer, orderNumber, destination) {
    try {
      const response = await instance.put("/packingSlips", {
        items,
        customer,
        orderNumber,
        destination,
      });

      return response.data;
    } catch (error) {
      console.error("createPackingSlip", error);
      throw new Error(
        error?.response?.data ?? "An error occurred creating packing slip"
      );
    }
  },

  async searchPackingSlips(customerId, shipmentId) {
    try {
      const response = await instance.get("/packingSlips/search", {
        params: {
          customer: customerId,
          shipment: shipmentId,
        },
      });
      return response.data;
    } catch (error) {
      console.error("searchPackingSlips", error);
      throw new Error(
        error?.response?.data ?? "An error occurred searching packing slips"
      );
    }
  },

  async searchPackingSlipsHistory(
    sortBy,
    sortOrder,
    matchOrder,
    matchPart,
    resultsPerPage,
    pageNumber
  ) {
    try {
      const response = await instance.get("/packingSlips/histSearch", {
        params: {
          sortBy,
          sortOrder,
          matchOrder,
          matchPart,
          resultsPerPage,
          pageNumber,
        },
      });
      return response.data;
    } catch (error) {
      console.error("searchPackingSlipsHistory", error);
      throw new Error(
        error?.response?.data ??
          "An error occurred searching packing slip history"
      );
    }
  },

  async getShippingQueue() {
    try {
      const response = await instance.get("/shipments/queue");
      return response.data;
    } catch (error) {
      console.error("getShippingQueue", error);
      throw new Error(
        error?.response?.data ?? "An error occurred getting shipping queue"
      );
    }
  },

  async getShippingHistory() {
    try {
      const response = await instance.get("/shipments");
      return response.data;
    } catch (error) {
      console.error("getShippingHistory", error);
      throw new Error(
        error?.response?.data ?? "An error occurred getting shipping history"
      );
    }
  },

  async getPendingShipments() {
    try {
      const response = await instance.get("/shipments/pending");
      return response.data;
    } catch (error) {
      console.error("getPendingShipment", error);
      throw new Error(
        error?.response?.data ?? "An error occurred getting pending shipments"
      );
    }
  },

  async deleteShipment(id) {
    try {
      const response = await instance.delete(`/shipments/${id}`);
      return response.data;
    } catch (error) {
      console.error("deleteShipment", error);
      throw new Error(
        error?.response?.data ?? "An error occurred deleting shipment"
      );
    }
  },

  async getShipment(id) {
    try {
      const response = await instance.get(`/shipments/${id}`);
      return response.data;
    } catch (error) {
      console.error("getShipment", error);
      throw new Error(
        error?.response?.data ?? "An error occurred getting shipment"
      );
    }
  },

  async patchShipment(id, updatedShipment, isPending) {
    try {
      const response = await instance.patch(
        `/shipments/${id}${isPending ? "/pending" : ""}`,
        {
          ...updatedShipment,
          shippingAddress: updatedShipment.specialShippingAddress,
        }
      );
      return response.data;
    } catch (error) {
      console.error("patchShipment", error);
      throw new Error(
        error?.response?.data ?? "An error occurred patching shipment"
      );
    }
  },

  async searchShippingHistory(
    sortBy,
    sortOrder,
    matchOrder,
    matchPart,
    resultsPerPage,
    pageNumber
  ) {
    try {
      const response = await instance.get(`/shipments/search`, {
        params: {
          sortBy,
          sortOrder,
          matchOrder,
          matchPart,
          resultsPerPage,
          pageNumber,
        },
      });
      return response.data;
    } catch (error) {
      console.error("searchShippingHistory", error);
      throw new Error(
        error?.response?.data ?? "An error occurred searching shipping history"
      );
    }
  },

  async getPackingSlipHistory() {
    try {
      const response = await instance.get("/packingSlips");
      return response.data;
    } catch (error) {
      console.error("getPackingSlipHistory", error);
      throw new Error(
        error?.response?.data ??
          "An error occurred getting packing slip history"
      );
    }
  },

  async deletePackingSlip(id) {
    try {
      const response = await instance.delete(`/packingSlips/${id}`);
      return response.data;
    } catch (error) {
      console.error("deletePackingSlip", error);
      throw new Error(
        error?.response?.data ?? "An error occurred deleting packing slip"
      );
    }
  },

  async createIncomingDelivery(
    internalPurchaseOrderNumber,
    dueBackDate,
    sourceShipmentId
  ) {
    try {
      const response = await instance.put("/incomingDeliveries", {
        internalPurchaseOrderNumber,
        dueBackDate,
        sourceShipmentId,
      });

      return response.data;
    } catch (error) {
      console.error("createIncomingDelivery", error);
      throw new Error(
        error?.response?.data ?? "An error occurred creating incoming delivery"
      );
    }
  },

  async createShipment(
    manifest,
    customer,
    deliveryMethod,
    trackingNumber = undefined,
    cost = undefined,
    carrier = undefined,
    deliverySpeed = undefined,
    customerAccount = undefined,
    customerHandoffName = undefined,
    shippingAddress = undefined,
    isDueBack = undefined,
    isDueBackOn = undefined
  ) {
    try {
      const response = await instance.put("/shipments", {
        manifest,
        customer,
        deliveryMethod,
        trackingNumber,
        cost,
        carrier,
        deliverySpeed,
        customerAccount,
        customerHandoffName,
        shippingAddress,
        isDueBack,
        isDueBackOn: isDueBackOn?.$d.toLocaleDateString(),
      });

      return response.data;
    } catch (error) {
      console.error("createShipment", error);
      throw new Error(
        error?.response?.data ?? "An error occurred creating shipment"
      );
    }
  },

  async patchPackingSlip(id, updatedItems) {
    try {
      const response = await instance.patch(
        `/packingSlips/${id}`,
        updatedItems
      );

      return response.data;
    } catch (error) {
      console.error("patchPackingSlip", error);
      throw new Error(
        error?.response?.data ?? "An error occurred patching packing slip"
      );
    }
  },

  async getReceivingQueue() {
    try {
      const response = await instance.get("/incomingDeliveries/queue");
      return response.data;
    } catch (error) {
      console.error("getShippingQueue", error);
      throw new Error(
        error?.response?.data ?? "An error occurred getting shipping queue"
      );
    }
  },

  async getReceivingHistory() {
    try {
      const response = await instance.get("/incomingDeliveries/allReceived");
      return response.data;
    } catch (error) {
      console.error("getReceivingHistory", error);
      throw new Error(
        error?.response?.data ?? "An error occurred getting receiving history"
      );
    }
  },

  async submitIncomingDelivery(_id, sourcePOType, sourcePOId, linesReceived) {
    try {
      const response = await instance.post("/incomingDeliveries/receive", {
        _id,
        sourcePOType,
        sourcePOId,
        linesReceived,
      });
      return response.data;
    } catch (error) {
      console.error("submitIncomingDelivery", error);
      throw new Error(
        error?.response?.data ?? "An error occurred downloading PDF"
      );
    }
  },

  async cancelIncomingDelivery(_id, reason) {
    try {
      const response = await instance.put("/incomingDeliveries/cancel", {
        _id,
        reason,
      });
      return response.data;
    } catch (error) {
      console.error("cancelIncomingDelivery", error);
      throw new Error(
        error?.response?.data ?? "An error occurred canceling incoming delivery"
      );
    }
  },

  async getOneReceivingHistoryElement(deliveryId) {
    try {
      const response = await instance.get(`/incomingDeliveries/${deliveryId}`);
      return response.data;
    } catch (error) {
      console.error("getOneReceivingHistoryElement", error);
      throw new Error(
        error?.response?.data ?? "An error occurred receiving history element"
      );
    }
  },

  async undoReceiving(deliveryId) {
    try {
      const response = await instance.post(`/incomingDeliveries/undoReceive`, {
        deliveryId,
      });
      return response.data;
    } catch (error) {
      console.error("undoReceiving", error);
      throw new Error(
        error?.response?.data ?? "An error occurred undoing receiving"
      );
    }
  },

  async patchIncomingDelivery(deliveryId, edited) {
    try {
      const response = await instance.patch(
        `/incomingDeliveries/${deliveryId}`,
        {
          ...edited,
        }
      );
      return response.data;
    } catch (error) {
      console.error("patchIncomingDelivery", error);
      throw new Error(
        error?.response?.data ?? "An error occurred updated delivery"
      );
    }
  },

  async undoReciept(deliveryId) {
    try {
      const response = await instance.patch(
        `/incomingDeliveries/${deliveryId}/undoReceipt`,
        {
          deliveryId,
        }
      );
      return response.data;
    } catch (error) {
      console.error("undoReciept", error);
      throw new Error(
        error?.response?.data ?? "An error occurred undoing receipt"
      );
    }
  },

  async getPendingPackingQueue() {
    try {
      const response = await instance.get("/packingSlips/pending");
      return response.data;
    } catch (error) {
      console.error("getPendingPackingQueue", error);
      throw new Error(
        error?.response?.data ??
          "An error occurred getting packing slip pending queue"
      );
    }
  },

  async getSignedUploadUrl(location) {
    try {
      const response = await instance.post(`/storage/upload`, {
        location,
      });

      return response.data;
    } catch (error) {
      console.error("getSignedUploadUrl", error);
      throw new Error(
        error?.response?.data ?? "An error occurred signed upload URL"
      );
    }
  },

  async uploadBySignedUrl(url, file, type) {
    try {
      const response = await axios.put(url, file, {
        headers: {
          "content-type": type,
        },
      });

      return response.data;
    } catch (error) {
      console.error("getSignedUploadUrl", error);
      throw new Error(
        error?.response?.data ?? "An error occurred signed upload URL"
      );
    }
  },

  async deleteRouterURL(id, itemId) {
    try {
      const response = await instance.delete(
        `/packingSlips/routerUpload/${id}`,
        {
          data: {
            itemId,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("deleteRouterUpload", error);
      throw new Error(
        error?.response?.data ?? "An error occurred deleting a router upload"
      );
    }
  },

  async generateQRCode(tempShipId) {
    try {
      const response = await instance.post("/qrCode/getTempShipCode", {
        tempShipmentId: tempShipId,
      });

      return response.data["qrCode"];
    } catch (error) {
      console.error("generateQRCode", error);
      throw new Error(
        error?.response?.data ?? "An error occurred getting qr code"
      );
    }
  },

  async createTempShipment(manifest) {
    try {
      const response = await instance.put("/tempShipments", {
        manifest,
      });

      return response.data["tempShipment"];
    } catch (error) {
      console.error("createTempShipment", error);
      throw new Error(
        error?.response?.data ?? "An error occurred creating temp shipment"
      );
    }
  },

  async deleteTempShipment(tempShipmentId) {
    try {
      const response = await instance.delete(
        `/tempShipments/${tempShipmentId}`
      );
      return response.data;
    } catch (error) {
      console.error("deleteTempShipment", error);
      throw new Error(
        error?.response?.data ?? "An error occurred deleting temp shipment"
      );
    }
  },
};
