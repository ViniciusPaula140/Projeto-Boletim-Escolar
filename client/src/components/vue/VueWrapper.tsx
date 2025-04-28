import React, { useEffect, useRef } from 'react';
import { createApp, defineComponent } from 'vue';

/**
 * Interface para as propriedades do componente Vue
 */
interface VueWrapperProps {
  componentPath: string;
  mountId: string;
}

/**
 * Componente para integrar componentes Vue em aplicações React
 * @param {VueWrapperProps} props - Propriedades do componente
 * @returns {JSX.Element} Elemento JSX que monta um componente Vue
 */
const VueWrapper: React.FC<VueWrapperProps> = ({ componentPath, mountId }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const appInstanceRef = useRef<any>(null);
  
  useEffect(() => {
    // Função assíncrona para importar e montar o componente Vue
    const mountVueComponent = async () => {
      try {
        console.log('Mounting Vue component from path:', componentPath);
        
        // Importing Vue component dynamically
        const module = await import(/* @vite-ignore */ componentPath);
        const vueComponent = module.default;
        
        if (!vueComponent) {
          console.error(`Vue component not found at path: ${componentPath}`);
          return;
        }
        
        // Creating Vue application and mounting the component
        if (containerRef.current) {
          console.log('Creating Vue app instance');
          const app = createApp(vueComponent);
          
          // Store reference to app instance for cleanup
          appInstanceRef.current = app;
          
          console.log('Mounting Vue component to DOM element');
          app.mount(containerRef.current);
          console.log('Vue component mounted successfully');
        } else {
          console.error('Container reference not available for Vue component');
        }
      } catch (error) {
        console.error(`Error mounting Vue component (${componentPath}):`, error);
      }
    };
    
    mountVueComponent();
    
    // Cleanup function
    return () => {
      if (appInstanceRef.current) {
        console.log('Unmounting Vue component');
        appInstanceRef.current.unmount();
        appInstanceRef.current = null;
      }
    };
  }, [componentPath]);
  
  return <div id={mountId} ref={containerRef}></div>;
};

export default VueWrapper;
