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
      return response.data;
    } catch (error) {
      console.error("downloadPDF", error);
      throw "downloadPDF";
    }
  },

  async getPackingQueue() {
    try {
      const response = await instance.get("/workOrders/packingQueue");
      return response.data;
    } catch (error) {
      console.error("getPackingQueue", error);
      throw "getPackingQueue";
    }
  },

  async getAllWorkOrders() {
    try {
      const response = await instance.get("/workOrders");
      return response.data;
    } catch (error) {
      console.error("getAllWorkOrders", error);
      throw "getAllWorkOrders";
    }
  },

  async createPackingSlip(items, customer, orderNumber) {
    try {
      const response = await instance.put("/packingSlips", {
        items,
        customer,
        orderNumber,
      });

      return response.data;
    } catch (error) {
      console.error("createPackingSlip", error);
      throw "createPackingSlip";
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
      throw "searchPackingSlips";
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
      throw "searchPackingSlipsHistory";
    }
  },

  async getShippingQueue() {
    try {
      const response = await instance.get("/shipments/queue");
      return response.data;
    } catch (error) {
      console.error("getShippingQueue", error);
      throw "getShippingQueue";
    }
  },

  async getShippingHistory() {
    try {
      const response = await instance.get("/shipments");
      return response.data;
    } catch (error) {
      console.error("getShippingHistory", error);
      throw "getShippingHistory";
    }
  },

  async deleteShipment(id) {
    try {
      const response = await instance.delete(`/shipments/${id}`);
      return response.data;
    } catch (error) {
      console.error("deleteShipment", error);
      throw "deleteShipment";
    }
  },

  async getShipment(id) {
    try {
      const response = await instance.get(`/shipments/${id}`);
      return response.data;
    } catch (error) {
      console.error("getShipment", error);
      throw "getShipment";
    }
  },

  async patchShipment(id, updatedShipment) {
    try {
      const response = await instance.patch(
        `/shipments/${id}`,
        updatedShipment
      );
      return response.data;
    } catch (error) {
      console.error("patchShipment", error);
      throw "patchShipment";
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
      throw "searchShippingHistory";
    }
  },

  async getPackingSlipHistory() {
    try {
      const response = await instance.get("/packingSlips");
      return response.data;
    } catch (error) {
      console.error("getPackingSlipHistory", error);
      throw "getPackingSlipHistory";
    }
  },

  async deletePackingSlip(id) {
    try {
      const response = await instance.delete(`/packingSlips/${id}`);
      return response.data;
    } catch (error) {
      console.error("deletePackingSlip", error);
      throw error?.response?.data;
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
    customerHandoffName = undefined
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
      });

      return response.data;
    } catch (error) {
      console.error("createShipment", error);
      throw "createShipment";
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
      throw "patchPackingSlip";
    }
  },
};
