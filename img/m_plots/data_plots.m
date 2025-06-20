clear all;
close all;

X = [0, 40, 60, 80, 100];
Y = [5, 18, 20, 15, 20];

F = polyfit(X,Y,4);
figure(1);

x = linspace(0,100,400);
y = polyval(F,x);
plot(x,y,'k','linewidth',2);
xlabel('X'); ylabel('Y');
box on;
set(gca, 'linewidth',2);
saveas(gcf,'../data_f','svg');

synthetic_x = -5:3:105;

% Pre-calculated synthetic data
synthetic_y = [6.0590
    7.9637
    2.0358
    6.5821
    2.2788
    2.5735
    3.1922
    4.6423
    8.8487
    8.0417
    9.8583
   14.7060
   16.7046
   16.4390
   15.6880
   19.7990
   18.1721
   20.3822
   20.9813
   23.0405
   20.2662
   23.0697
   22.7466
   19.4850
   19.3263
   16.3153
   16.5299
   18.3530
   16.5477
   13.0049
   14.1232
   15.5736
   11.7859
   14.9565
   14.7339
   20.0998
   26.0369]';

% Create new synthetic data
%synthetic_y = polyval(F,synthetic_x) + 6*rand(1,size(synthetic_x,2))-3;

%%%
figure(2);
hold on;
plot(x,y,'k','linewidth',2);
  xlabel('X'); ylabel('Y');
plot(synthetic_x,synthetic_y, 'ro','linewidth',2);
  xlabel('X'); ylabel('Y');
xlim([0,100]); ylim([0,25]);
box on;
set(gca, 'linewidth',2);
saveas(gcf,'../data_f_plus_data','svg');

%%%
figure(3);
plot(synthetic_x,synthetic_y, 'ro','linewidth',2);
  xlabel('X'); ylabel('Y');
xlim([0,100]); ylim([0,25]);
box on;
set(gca, 'linewidth',2);
saveas(gcf,'../data_no_f','svg');

%%% Models
figure(4);
hold on;
plot(synthetic_x,synthetic_y, 'ro','linewidth',2);
  xlabel('X'); ylabel('Y');

n1 = polyfit(synthetic_x,synthetic_y,1);
n1_y = polyval(n1,x);
plot(x,n1_y,'linewidth',3);

n2 = polyfit(synthetic_x,synthetic_y,2);
n2_y = polyval(n2,x);
plot(x,n2_y,'linewidth',3);

n4 = polyfit(synthetic_x,synthetic_y,4);
n4_y = polyval(n4,x);
plot(x,n4_y,'linewidth',3);

n12 = polyfit(synthetic_x,synthetic_y,21); % High order polynomial
n12_y = polyval(n12,x);
plot(x,n12_y,'linewidth',3);
xlim([0,100]); ylim([0,25]);
box on;
set(gca, 'linewidth',2);

saveas(gcf,'../data_models','svg');

% New figure with data
figure();
hold on;
plot(synthetic_x,synthetic_y, 'ro','linewidth',2);
xlabel('X'); ylabel('Y');
xlim([0,100]); ylim([0,25]);  box on; set(gca, 'linewidth',2);

plot(x,n1_y,'linewidth',3);
saveas(gcf,'../data_model_n1','svg');

% New figure with data
figure();
hold on;
plot(synthetic_x,synthetic_y, 'ro','linewidth',2);
xlabel('X'); ylabel('Y');
xlim([0,100]); ylim([0,25]);  box on; set(gca, 'linewidth',2);

plot(x,n4_y,'linewidth',3);
saveas(gcf,'../data_model_n4','svg');

% New figure with data
figure();
hold on;
plot(synthetic_x,synthetic_y, 'ro','linewidth',2);
xlabel('X'); ylabel('Y');
xlim([0,100]); ylim([0,25]);  box on; set(gca, 'linewidth',2);

plot(x,n2_y,'linewidth',3,'color',[1 0.3 0]);
saveas(gcf,'../data_model_n2','svg');


% New figure with data
figure();
hold on;
plot(synthetic_x,synthetic_y, 'ro','linewidth',2);
xlabel('X'); ylabel('Y');
xlim([0,100]); ylim([0,25]);  box on; set(gca, 'linewidth',2);

plot(x,n12_y,'linewidth',3,'color',[0.5 0 0.5]);
saveas(gcf,'../data_model_n12','svg');























