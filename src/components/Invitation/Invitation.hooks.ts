import {useMutation} from "@tanstack/react-query";
import {liff} from "@/utils/liff";

export const useShareTargetPicker = () => {
 return useMutation({
     mutationFn: async () => liff.shareTargetPicker([
             {
                 type: "text",
                 text: "Hello, World!",
             },
         ],
         {
             isMultiple: true,
         }),
     onError: () => alert('Something went wrong'),
 })
}