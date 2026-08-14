export type Product={slug:string;name:string;color:string;price:number;note:string;story:string;size:string;printTime:string;palette:string[]};
export const products:Product[]=[
 {slug:"momo",name:"Momo",color:"coral",price:1290000,note:"Ngọt ngào cho góc nhỏ",story:"Momo là một cục nắng nhỏ: mềm mại, ấm áp và luôn sẵn sàng làm căn phòng vui lên một chút.",size:"Ø 22 × H 28 cm",printTime:"18–22 giờ",palette:["Butter","Coral","Milk"]},
 {slug:"pip",name:"Pip",color:"lilac",price:1490000,note:"Một chút mộng mơ",story:"Pip dành cho những buổi tối muốn sống chậm, nghe một playlist cũ và để trí tưởng tượng đi lang thang.",size:"Ø 24 × H 30 cm",printTime:"22–26 giờ",palette:["Lilac","Peach","Milk"]},
 {slug:"bibi",name:"Bibi",color:"blue",price:1390000,note:"Bầu trời sau giờ làm",story:"Bibi mang một mảng trời dịu vào nhà, giúp góc làm việc bớt nghiêm túc và giờ nghỉ trở nên thật sự nhẹ nhàng.",size:"Ø 21 × H 29 cm",printTime:"20–24 giờ",palette:["Sky","Butter","Coral"]},
];
export const money=(value:number)=>`${new Intl.NumberFormat("vi-VN").format(value)}₫`;
