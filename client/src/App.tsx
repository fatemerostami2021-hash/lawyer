import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import SiteChrome from "./components/SiteChrome";
import { ThemeProvider } from "./contexts/ThemeContext";
import NotFound from "./pages/NotFound";
import HomePage from "./pages/HomePage";
import AboutPage from "./pages/AboutPage";
import ExpertisePage from "./pages/ExpertisePage";
import ApproachPage from "./pages/ApproachPage";
import InsightsPage from "./pages/InsightsPage";
import InsightDetailPage from "./pages/InsightDetailPage";
import ContactPage from "./pages/ContactPage";
import FaqPage from "./pages/FaqPage";

function Router() {
  return <Switch>
    <Route path="/" component={HomePage} />
    <Route path="/about" component={AboutPage} />
    <Route path="/expertise" component={ExpertisePage} />
    <Route path="/approach" component={ApproachPage} />
    <Route path="/insights" component={InsightsPage} />
    <Route path="/insights/:slug" component={InsightDetailPage} />
    <Route path="/faq" component={FaqPage} />
    <Route path="/contact" component={ContactPage} />
    <Route path="/404" component={NotFound} />
    <Route component={NotFound} />
  </Switch>;
}

export default function App() {
  return <ErrorBoundary><ThemeProvider defaultTheme="dark"><TooltipProvider><Toaster /><SiteChrome><Router /></SiteChrome></TooltipProvider></ThemeProvider></ErrorBoundary>;
}
