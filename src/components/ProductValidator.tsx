import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./../components/ui/card";
import { Textarea } from "./../components/ui/textarea";
import { Badge } from "./../components/ui/badge";
import { CheckCircle, Code, AlertTriangle, Rocket } from "lucide-react";

// Adobe Analytics product string validation logic
const processEventAttributes = (eventAttribute: string) => {
  if (typeof eventAttribute !== 'string' || !eventAttribute?.includes('|')) return;
  return eventAttribute.split('|').map((event) => {
    const [key, value] = event.split('=');
    return { [key]: value };
  });
};

const normalizeAttributes = (raw: string) => {
  const result = raw ? processEventAttributes(raw) : [];
  return result ?? [];
};

interface Product {
  category: string;
  item: string;
  quantity: number;
  price: number;
  events: any[];
  evars: any[];
  isValid: boolean;
}

const parseProduct = (product: string): Product => {
  const parts = product.split(';');
  const [category, item, quantity, price, rawEvents, rawEvars] = parts;
  
  // Check if we have the minimum required parts (category, item, quantity, price)
  const hasMinimumParts = parts.length >= 4;
  const hasValidItem = Boolean(item && item.trim());
  const parsedPrice = parseFloat(price?.replace(',', '.') || '0'); // Handle comma decimal separator
  const isValidPrice = !isNaN(parsedPrice) && parsedPrice >= 0;
  
  return {
    category: category || '',
    item: item || '',
    quantity: Number(quantity) || 0,
    price: parsedPrice,
    events: normalizeAttributes(rawEvents),
    evars: normalizeAttributes(rawEvars),
    isValid: hasMinimumParts && hasValidItem && isValidPrice,
  };
};

const validateProductString = (s: string): Product[] => {
  if (typeof s !== 'string' || !s.trim()) return [];
  
  // Split on commas - this will break if there are commas in price fields
  const rawProducts = s.split(',');
  const products = rawProducts.map(parseProduct);
  
  // Detect cascading parsing errors caused by commas in prices
  let hasCascadingError = false;
  products.forEach((product, index) => {
    // If a "category" looks like it could be part of a price (contains numbers and dots/commas)
    if (product.category && /^\d+[.,]\d*$/.test(product.category.trim())) {
      console.warn(`Cascading parsing error detected at product ${index + 1}. Comma in previous product's price field is breaking parsing.`);
      hasCascadingError = true;
    }
    // If category starts with just numbers, it's likely a price fragment
    if (product.category && /^\d+$/.test(product.category.trim())) {
      console.warn(`Product ${index + 1} category is just numbers - likely a cascading parsing error.`);
      hasCascadingError = true;
    }
  });
  
  // Mark all products as invalid if there's a cascading error
  if (hasCascadingError) {
    products.forEach(product => {
      if (product.isValid) {
        product.isValid = false; // Cascade the invalidity
      }
    });
  }
  
  return products;
};

export default function ProductValidator() {
  const [prodString, setProdString] = useState(
    "Example category 1;Example product 1;1;3.50,Example category 2;Example product 2;1;5.99"
  );
  const [validation, setValidation] = useState<Product[]>([]);
  const [isStringValid, setIsStringValid] = useState(true);

  useEffect(() => {
    const validationResult = validateProductString(prodString);
    setValidation(validationResult);
    setIsStringValid(!validationResult.some(p => !p.isValid));
  }, [prodString]);

  // const handleValidate = () => {
  //   const validationResult = validateProductString(prodString);
  //   setValidation(validationResult);
  //   setIsStringValid(!validationResult.some(p => !p.isValid));
  // };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm container mx-auto p-6 space-y-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-center items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[#16878c] to-[#ED2224] rounded-xl flex items-center justify-center">
              <Code className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Adobe Analytics Product String Validator</h1>
              <p className="text-gray-600 mt-1">Validate and parse your Adobe Analytics products parameter</p>
            </div>
          </div>
        </div>
      </header>
      {/* Input Section */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <Rocket className="h-5 w-5" />
            Product String Input
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={prodString}
            onChange={(e) => setProdString(e.target.value)}
            placeholder="Enter your Adobe Analytics product string here..."
            className="min-h-[120px] font-mono text-sm"
          />
          {/* <Button onClick={handleValidate} className="w-full bg-primary hover:bg-primary/90">
            Validate Product String
          </Button> */}
        </CardContent>
      </Card>

      {/* Validation Status */}
      <Card className={`shadow-card border-l-4 ${isStringValid ? 'border-l-success' : 'border-l-destructive'}`}>
        <CardContent className="pt-6">
          <div className="flex justify-center items-center gap-3">
            {isStringValid ? (
              <CheckCircle className="h-6 w-6 text-success" />
            ) : (
              <AlertTriangle className="h-6 w-6 text-destructive" />
            )}
            <div>
              <h3 className="font-semibold text-lg">
                {isStringValid ? 'Valid Product String' : 'Invalid Product String' }
              </h3>
              <p className="text-muted-foreground">
                {isStringValid 
                  ? 'All products in the string are valid'
                  : 'Parsing errors detected - check for commas'
                }
              </p>
              {!isStringValid && validation.some(p => p.category && /^\d+[.,]?\d*$/.test(p.category.trim())) && (
                <div className="mt-3 p-3 bg-destructive/10 rounded-md">
                  <p className="text-sm text-destructive font-medium">
                    ⚠️ Cascading Parse Error Detected
                  </p>
                  <p className="text-xs text-destructive mt-1">
                    Using commas in price fields (e.g., "999,99") breaks the parsing because commas are used as product separators. 
                    Use dots for decimals (e.g., "999.99") instead.
                  </p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Section */}
      {validation.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-primary">Parsed Products</h2>
          <div className="grid gap-4">
            {validation.map((product, index) => (
              <Card key={index} className={`shadow-card ${!product.isValid ? 'border-destructive' : ''}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Product {index + 1}</CardTitle>
                    <div className="flex gap-2">
                      <Badge variant={product.isValid ? "default" : "destructive"}>
                        {product.isValid ? "Valid" : "Invalid"}
                      </Badge>
                      {/* Show warning if category looks like a number (possible parsing error) */}
                      {product.category && /^\d+[.,]\d+/.test(product.category) && (
                        <Badge variant="destructive">
                          Parsing Error
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Category</label>
                      <p className={`font-mono text-sm p-2 rounded ${
                        product.category && /^\d+[.,]\d+/.test(product.category) 
                          ? 'bg-destructive/10 text-destructive' 
                          : 'bg-muted'
                      }`}>
                        {product.category || 'N/A'}
                        {product.category && /^\d+[.,]\d+/.test(product.category) && (
                          <span className="block text-xs text-destructive mt-1">
                            ⚠️ This looks like a price fragment - check for comma in price field
                          </span>
                        )}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Item</label>
                      <p className={`font-mono text-sm p-2 rounded ${!product.item ? 'bg-destructive/10 text-destructive' : 'bg-muted'}`}>
                        {product.item || 'Missing (Required)'}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Quantity</label>
                      <p className="font-mono text-sm bg-muted p-2 rounded">
                        {product.quantity}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Price</label>
                      <p className="font-mono text-sm bg-muted p-2 rounded">
                        {product.price.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  
                  {(product.events?.length > 0 || product.evars?.length > 0) && (
                    <div className="grid md:grid-cols-2 gap-4 pt-3 border-t">
                      {product.events?.length > 0 && (
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Events</label>
                          <div className="space-y-1 mt-1">
                            {product.events.map((event, eventIndex) => (
                              <div key={eventIndex} className="font-mono text-xs bg-adobe-teal/10 p-2 rounded">
                                {Object.entries(event).map(([key, value]) =>
                                  value !== undefined ? (
                                    <span key={key}>{key}={String(value)}</span>
                                  ) : <span key={key}>{key}{''}</span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {product.evars?.length > 0 && (
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">eVars</label>
                          <div className="space-y-1 mt-1">
                            {product.evars.map((evar, evarIndex) => (
                              <div key={evarIndex} className="font-mono text-xs bg-adobe-teal/10 p-2 rounded">
                                {Object.entries(evar).map(([key, value]) =>
                                  value !== undefined ? (
                                    <span key={key}>{key}={String(value)}</span>
                                  ) : <span key={key}>{key}{''}</span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      { /* Footer */}
      <footer className="text-center text-sm text-muted-foreground mt-12 mb-6">
        <p>
          Built by <a href="https://paolobietolini.com" target="_blank" className="text-primary hover:underline">Paolo Bietolini</a>. 
          View the source on <a href="https://github.com/paolobtl/aa-product-validator" target="_blank" className="text-primary hover:underline">GitHub</a>.
        </p>
      </footer>
    </div>
  );
}