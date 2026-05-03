describe("Recycle centres module", () => {
  beforeEach(() => {
    cy.fixture("recycle-centres.json").then((centres) => {
      cy.intercept("GET", "**/api/recycling-centers", {
        statusCode: 200,
        body: { recyclingCenters: centres },
      }).as("getCentres");
    });

    cy.fixture("categories.json").then((categories) => {
      cy.intercept("GET", "**/api/categories*", {
        statusCode: 200,
        body: { categories },
      }).as("getCategories");
    });

    cy.intercept("GET", "**/api/recycling-centers/by-waste/Plastic", {
      statusCode: 200,
      body: {
        recyclingCenters: [
          {
            _id: "centre-1",
            name: "Colombo Plastic Hub",
            address: "12 Marine Drive, Colombo",
            location: {
              type: "Point",
              coordinates: [79.8612, 6.9271],
            },
            acceptedWasteTypes: ["Plastic", "Paper"],
            operatingHours: "Mon-Fri 08:00-18:00",
            maxCapacityKg: 1000,
            currentLoadKg: 400,
          },
        ],
      },
    }).as("filterPlastic");

    cy.visit("/centres", {
      onBeforeLoad(win) {
        win.localStorage.setItem(
          "eco-auth",
          JSON.stringify({
            state: {
              user: {
                id: "user-1",
                name: "Cypress Admin",
                role: "admin",
              },
              token: "fake-jwt-token",
            },
            version: 0,
          }),
        );
      },
    });

    cy.location("pathname").should("eq", "/centres");
    cy.wait("@getCentres");
    cy.wait("@getCategories");
  });

  it("renders recycling centres loaded from the API", () => {
    cy.contains("h1", "Recycle Centres").should("be.visible");
    cy.contains("Colombo Plastic Hub").should("be.visible");
    cy.contains("Kandy E-Waste Point").should("be.visible");
    cy.contains("400 / 1,000 kg").should("be.visible");
  });

  it("filters centres by waste type", () => {
    cy.get("select").select("Plastic");
    cy.wait("@filterPlastic");

    cy.contains("Colombo Plastic Hub").should("be.visible");
    cy.contains("Kandy E-Waste Point").should("not.exist");
  });

  it("opens the add centre modal for admins", () => {
    cy.contains("button", "+ Add Centre").should("be.visible").click();

    cy.contains("h2", "Add Recycling Centre").should("be.visible");
    cy.contains("label", "Name").should("be.visible");
    cy.contains("label", "Address").should("be.visible");
    cy.contains("label", "Longitude").should("be.visible");
    cy.contains("label", "Latitude").should("be.visible");
    cy.contains("label", "Operating Hours").should("be.visible");
    cy.contains("label", "Max Capacity (kg)").should("be.visible");
    cy.contains("label", "Current Load (kg)").should("be.visible");
    cy.contains("label", "Accepted Waste Types").should("be.visible");
    cy.contains("button", "Create Centre").should("be.visible");
  });

  it("creates a new centre and refreshes the list", () => {
    const newCentre = {
      _id: "centre-3",
      name: "Galle Green Hub",
      address: "88 Lighthouse Street, Galle",
      location: {
        type: "Point",
        coordinates: [80.217, 6.0329],
      },
      acceptedWasteTypes: ["Plastic", "E-Waste"],
      operatingHours: "Mon-Sat 08:30-17:30",
      maxCapacityKg: 750,
      currentLoadKg: 120,
    };

    const expectedPayload = {
      name: newCentre.name,
      address: newCentre.address,
      location: {
        type: "Point",
        coordinates: [80.217, 6.0329],
      },
      acceptedWasteTypes: ["Plastic", "E-Waste"],
      operatingHours: newCentre.operatingHours,
      maxCapacityKg: 750,
      currentLoadKg: 120,
    };

    cy.contains("button", "+ Add Centre").click();

    cy.contains("h2", "Add Recycling Centre")
      .closest(".modal-box")
      .within(() => {
        cy.get("input").eq(0).type(newCentre.name);
        cy.get("input").eq(1).type(newCentre.address);
        cy.get('input[type="number"]').eq(0).clear().type("80.217");
        cy.get('input[type="number"]').eq(1).clear().type("6.0329");
        cy.get("input").eq(4).type(newCentre.operatingHours);
        cy.get('input[type="number"]').eq(2).clear().type("750");
        cy.get('input[type="number"]').eq(3).clear().type("120");

        cy.contains("button", "Plastic").click();
        cy.contains("button", "E-Waste").click();
      });

    cy.intercept("POST", "**/api/admin/recycling-centers", (req) => {
      expect(req.body).to.deep.equal(expectedPayload);
      req.reply({
        statusCode: 201,
        body: { recyclingCenter: newCentre },
      });
    }).as("createCentre");

    cy.intercept("GET", "**/api/recycling-centers", {
      statusCode: 200,
      body: {
        recyclingCenters: [
          {
            _id: "centre-1",
            name: "Colombo Plastic Hub",
            address: "12 Marine Drive, Colombo",
            location: {
              type: "Point",
              coordinates: [79.8612, 6.9271],
            },
            acceptedWasteTypes: ["Plastic", "Paper"],
            operatingHours: "Mon-Fri 08:00-18:00",
            maxCapacityKg: 1000,
            currentLoadKg: 400,
          },
          {
            _id: "centre-2",
            name: "Kandy E-Waste Point",
            address: "44 Peradeniya Road, Kandy",
            location: {
              type: "Point",
              coordinates: [80.6337, 7.2906],
            },
            acceptedWasteTypes: ["E-Waste"],
            operatingHours: "Daily 09:00-17:00",
            maxCapacityKg: 500,
            currentLoadKg: 125,
          },
          newCentre,
        ],
      },
    }).as("reloadCentres");

    cy.contains("h2", "Add Recycling Centre")
      .closest(".modal-box")
      .within(() => {
        cy.contains("button", "Create Centre").click();
      });

    cy.wait("@createCentre");
    cy.wait("@reloadCentres");
    cy.contains("Recycle centre created successfully.").should("be.visible");
    cy.contains("Galle Green Hub").should("be.visible");
    cy.contains("88 Lighthouse Street, Galle").should("be.visible");
  });

  it("deletes a centre and refreshes the list", () => {
    cy.contains(".card", "Colombo Plastic Hub").click();
    cy.contains("button", "Delete").should("be.visible").click();

    cy.contains("h2", "Delete Recycle Centre").should("be.visible");
    cy.contains(
      'Delete "Colombo Plastic Hub"? This action cannot be undone.',
    ).should("be.visible");

    cy.intercept("DELETE", "**/api/admin/recycling-centers/centre-1", {
      statusCode: 200,
      body: { message: "Recycle centre deleted successfully." },
    }).as("deleteCentre");

    cy.intercept("GET", "**/api/recycling-centers", {
      statusCode: 200,
      body: {
        recyclingCenters: [
          {
            _id: "centre-2",
            name: "Kandy E-Waste Point",
            address: "44 Peradeniya Road, Kandy",
            location: {
              type: "Point",
              coordinates: [80.6337, 7.2906],
            },
            acceptedWasteTypes: ["E-Waste"],
            operatingHours: "Daily 09:00-17:00",
            maxCapacityKg: 500,
            currentLoadKg: 125,
          },
        ],
      },
    }).as("reloadAfterDelete");

    cy.contains("h2", "Delete Recycle Centre")
      .closest(".modal-box")
      .within(() => {
        cy.contains("button", "Delete").click();
      });

    cy.wait("@deleteCentre");
    cy.wait("@reloadAfterDelete");
    cy.contains("Recycle centre deleted successfully.").should("be.visible");
    cy.contains("Colombo Plastic Hub").should("not.exist");
    cy.contains("Kandy E-Waste Point").should("be.visible");
  });
});
