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
        packingSlipId, // this is the item._id not the item.packingSlipId the user interacts with (dumb name....)
        orderNumber,
        dateCreated,
      });
      console.log("pdf downloaded");
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

  async patchShipment(id, updatedShipment) {
    try {
      const response = await instance.patch(`/shipments/${id}`, {
        ...updatedShipment,
        shippingAddress: updatedShipment.specialShippingAddress,
      });
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
    shippingAddress = undefined
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
};
